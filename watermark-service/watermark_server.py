#!/usr/bin/env python3
"""
PhotoMint Invisible Watermarking Service
Robust DWT-DCT watermarking for ownership protection

This service provides:
1. Invisible watermark embedding during minting
2. Watermark extraction for verification
3. Multi-tier verification support
"""

import os
import io
import base64
import hashlib
import time
import zlib
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
from imwatermark import WatermarkEncoder, WatermarkDecoder

app = Flask(__name__)
CORS(app)

# Configuration
WATERMARK_METHOD = 'dwtDct'  # Most robust method
MAX_PAYLOAD_SIZE = 64  # bytes
VERSION = 'v1'

class WatermarkPayload:
    """Handles watermark payload creation and parsing"""
    
    @staticmethod
    def create_payload(token_id, creator_address, custom_data=""):
        """
        Create watermark payload with format:
        version|tokenId|creatorAddr|timestamp|customData|checksum
        """
        timestamp = str(int(time.time()))
        
        # Truncate addresses for space efficiency
        creator_short = creator_address[:10] if creator_address.startswith('0x') else creator_address[:8]
        
        # Build base payload
        base_payload = f"{VERSION}|{token_id}|{creator_short}|{timestamp}"
        if custom_data:
            base_payload += f"|{custom_data[:10]}"  # Limit custom data
        
        # Add CRC32 checksum
        checksum = zlib.crc32(base_payload.encode()) & 0xffffffff
        full_payload = f"{base_payload}|{checksum:08x}"
        
        # Ensure payload fits in size limit
        if len(full_payload.encode()) > MAX_PAYLOAD_SIZE:
            # Truncate if too long
            available_space = MAX_PAYLOAD_SIZE - len(f"{VERSION}|{token_id}|{creator_short}|{timestamp}||{checksum:08x}")
            if available_space > 0:
                custom_data = custom_data[:available_space]
                base_payload = f"{VERSION}|{token_id}|{creator_short}|{timestamp}|{custom_data}"
                checksum = zlib.crc32(base_payload.encode()) & 0xffffffff
                full_payload = f"{base_payload}|{checksum:08x}"
            else:
                # Remove custom data entirely
                base_payload = f"{VERSION}|{token_id}|{creator_short}|{timestamp}"
                checksum = zlib.crc32(base_payload.encode()) & 0xffffffff
                full_payload = f"{base_payload}|{checksum:08x}"
        
        return full_payload.encode()
    
    @staticmethod
    def parse_payload(payload_bytes):
        """Parse and validate watermark payload"""
        try:
            payload_str = payload_bytes.decode('utf-8', errors='ignore')
            parts = payload_str.split('|')
            
            if len(parts) < 5:
                return None
            
            version = parts[0]
            token_id = parts[1]
            creator_address = parts[2]
            timestamp = parts[3]
            
            # Handle optional custom data
            if len(parts) == 6:
                custom_data = ""
                checksum_hex = parts[4]
            else:
                custom_data = parts[4]
                checksum_hex = parts[5]
            
            # Verify checksum
            base_payload = f"{version}|{token_id}|{creator_address}|{timestamp}"
            if custom_data:
                base_payload += f"|{custom_data}"
            
            expected_checksum = zlib.crc32(base_payload.encode()) & 0xffffffff
            actual_checksum = int(checksum_hex, 16)
            
            if expected_checksum != actual_checksum:
                return None
            
            return {
                'version': version,
                'token_id': token_id,
                'creator_address': creator_address,
                'timestamp': int(timestamp),
                'custom_data': custom_data,
                'valid': True,
                'created_at': datetime.fromtimestamp(int(timestamp)).isoformat()
            }
            
        except Exception as e:
            print(f"Payload parsing error: {e}")
            return None

def image_to_cv2(image_data):
    """Convert various image formats to OpenCV format"""
    if isinstance(image_data, str):
        # Base64 encoded image
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    elif hasattr(image_data, 'read'):
        # File-like object
        image_bytes = image_data.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        # Assume it's already bytes
        nparr = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def cv2_to_bytes(cv2_image, format='JPEG', quality=95):
    """Convert OpenCV image to bytes"""
    if format.upper() == 'JPEG':
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        success, encoded_img = cv2.imencode('.jpg', cv2_image, encode_param)
    elif format.upper() == 'PNG':
        encode_param = [int(cv2.IMWRITE_PNG_COMPRESSION), 1]
        success, encoded_img = cv2.imencode('.png', cv2_image, encode_param)
    else:
        success, encoded_img = cv2.imencode('.jpg', cv2_image)
    
    if success:
        return encoded_img.tobytes()
    else:
        raise Exception("Failed to encode image")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'PhotoMint Watermarking Service',
        'version': VERSION,
        'method': WATERMARK_METHOD,
        'max_payload_size': MAX_PAYLOAD_SIZE
    })

@app.route('/embed', methods=['POST'])
def embed_watermark():
    """
    Embed invisible watermark in image
    
    Request JSON:
    {
        "image": "base64_encoded_image" or multipart file,
        "token_id": "123",
        "creator_address": "0x1234...",
        "custom_data": "optional_custom_data",
        "output_format": "JPEG" (optional),
        "quality": 95 (optional, for JPEG)
    }
    """
    try:
        # Get image data
        if 'file' in request.files:
            image_file = request.files['file']
            cv2_image = image_to_cv2(image_file)
            # Get other parameters from form data
            token_id = request.form.get('token_id')
            creator_address = request.form.get('creator_address')
            custom_data = request.form.get('custom_data', '')
            output_format = request.form.get('output_format', 'JPEG')
            quality = int(request.form.get('quality', 95))
        else:
            # JSON request
            data = request.get_json()
            if not data or 'image' not in data:
                return jsonify({'error': 'No image provided'}), 400
            
            cv2_image = image_to_cv2(data['image'])
            token_id = data.get('token_id')
            creator_address = data.get('creator_address')
            custom_data = data.get('custom_data', '')
            output_format = data.get('output_format', 'JPEG')
            quality = data.get('quality', 95)
        
        if not token_id or not creator_address:
            return jsonify({'error': 'token_id and creator_address are required'}), 400
        
        if cv2_image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Create watermark payload
        payload = WatermarkPayload.create_payload(token_id, creator_address, custom_data)
        
        print(f"Embedding watermark: {payload.decode('utf-8', errors='ignore')}")
        
        # Embed watermark
        encoder = WatermarkEncoder()
        encoder.set_watermark('bytes', payload)
        
        # Convert BGR to RGB for encoding (OpenCV uses BGR by default)
        watermarked_bgr = encoder.encode(cv2_image, WATERMARK_METHOD)
        
        # Convert back to bytes
        watermarked_bytes = cv2_to_bytes(watermarked_bgr, output_format, quality)
        
        # Calculate hashes for verification
        original_sha256 = hashlib.sha256(cv2_to_bytes(cv2_image)).hexdigest()
        watermarked_sha256 = hashlib.sha256(watermarked_bytes).hexdigest()
        
        response_data = {
            'success': True,
            'watermarked_image': base64.b64encode(watermarked_bytes).decode('utf-8'),
            'payload': payload.decode('utf-8', errors='ignore'),
            'payload_size': len(payload),
            'method': WATERMARK_METHOD,
            'original_sha256': original_sha256,
            'watermarked_sha256': watermarked_sha256,
            'format': output_format,
            'timestamp': int(time.time())
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Watermark embedding error: {e}")
        return jsonify({'error': f'Watermark embedding failed: {str(e)}'}), 500

@app.route('/extract', methods=['POST'])
def extract_watermark():
    """
    Extract watermark from image
    
    Request JSON:
    {
        "image": "base64_encoded_image" or multipart file,
        "expected_payload_size": 64 (optional)
    }
    """
    try:
        # Get image data
        if 'file' in request.files:
            image_file = request.files['file']
            cv2_image = image_to_cv2(image_file)
            expected_size = int(request.form.get('expected_payload_size', MAX_PAYLOAD_SIZE))
        else:
            # JSON request
            data = request.get_json()
            if not data or 'image' not in data:
                return jsonify({'error': 'No image provided'}), 400
            
            cv2_image = image_to_cv2(data['image'])
            expected_size = data.get('expected_payload_size', MAX_PAYLOAD_SIZE)
        
        if cv2_image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Try to extract watermark
        decoder = WatermarkDecoder('bytes', expected_size)
        
        try:
            extracted_payload = decoder.decode(cv2_image, WATERMARK_METHOD)
            
            # Parse payload
            parsed = WatermarkPayload.parse_payload(extracted_payload)
            
            if parsed:
                response_data = {
                    'success': True,
                    'watermark_found': True,
                    'payload': extracted_payload.decode('utf-8', errors='ignore'),
                    'parsed': parsed,
                    'method': WATERMARK_METHOD,
                    'extraction_timestamp': int(time.time())
                }
            else:
                response_data = {
                    'success': True,
                    'watermark_found': True,
                    'payload': extracted_payload.decode('utf-8', errors='ignore'),
                    'parsed': None,
                    'error': 'Invalid payload format or checksum mismatch',
                    'method': WATERMARK_METHOD,
                    'extraction_timestamp': int(time.time())
                }
            
            return jsonify(response_data)
            
        except Exception as decode_error:
            print(f"Watermark extraction failed: {decode_error}")
            return jsonify({
                'success': True,
                'watermark_found': False,
                'error': f'No watermark detected: {str(decode_error)}',
                'method': WATERMARK_METHOD,
                'extraction_timestamp': int(time.time())
            })
        
    except Exception as e:
        print(f"Watermark extraction error: {e}")
        return jsonify({'error': f'Watermark extraction failed: {str(e)}'}), 500

@app.route('/verify', methods=['POST'])
def verify_image():
    """
    Comprehensive image verification using multi-tier approach
    
    Request JSON:
    {
        "image": "base64_encoded_image",
        "expected_sha256": "abc123..." (optional),
        "expected_token_id": "123" (optional),
        "expected_creator": "0x123..." (optional)
    }
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        cv2_image = image_to_cv2(data['image'])
        if cv2_image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        expected_sha256 = data.get('expected_sha256')
        expected_token_id = data.get('expected_token_id')
        expected_creator = data.get('expected_creator')
        
        # Calculate current image hash
        current_image_bytes = cv2_to_bytes(cv2_image)
        current_sha256 = hashlib.sha256(current_image_bytes).hexdigest()
        
        verification_results = {
            'current_sha256': current_sha256,
            'verification_levels': {},
            'overall_result': 'unknown',
            'confidence': 0,
            'timestamp': int(time.time())
        }
        
        # Level 1: Exact SHA-256 match
        if expected_sha256:
            sha256_match = current_sha256.lower() == expected_sha256.lower()
            verification_results['verification_levels']['exact_hash'] = {
                'method': 'SHA-256',
                'match': sha256_match,
                'confidence': 100 if sha256_match else 0,
                'expected': expected_sha256,
                'actual': current_sha256
            }
            
            if sha256_match:
                verification_results['overall_result'] = 'verified'
                verification_results['confidence'] = 100
                return jsonify(verification_results)
        
        # Level 2: Watermark extraction
        try:
            decoder = WatermarkDecoder('bytes', MAX_PAYLOAD_SIZE)
            extracted_payload = decoder.decode(cv2_image, WATERMARK_METHOD)
            parsed = WatermarkPayload.parse_payload(extracted_payload)
            
            watermark_confidence = 0
            watermark_match = False
            
            if parsed and parsed['valid']:
                watermark_confidence = 85  # High confidence for valid watermark
                
                # Check specific expectations
                if expected_token_id and parsed['token_id'] == str(expected_token_id):
                    watermark_confidence = 90
                    watermark_match = True
                
                if expected_creator and expected_creator.lower().startswith(parsed['creator_address'].lower()):
                    watermark_confidence = 95
                    watermark_match = True
                
                verification_results['verification_levels']['watermark'] = {
                    'method': 'DWT-DCT Watermark',
                    'found': True,
                    'valid': True,
                    'match': watermark_match,
                    'confidence': watermark_confidence,
                    'extracted_data': parsed
                }
                
                if watermark_confidence >= 85:
                    verification_results['overall_result'] = 'verified'
                    verification_results['confidence'] = watermark_confidence
                    return jsonify(verification_results)
            else:
                verification_results['verification_levels']['watermark'] = {
                    'method': 'DWT-DCT Watermark',
                    'found': True,
                    'valid': False,
                    'match': False,
                    'confidence': 0,
                    'error': 'Invalid watermark payload'
                }
        
        except Exception as watermark_error:
            verification_results['verification_levels']['watermark'] = {
                'method': 'DWT-DCT Watermark',
                'found': False,
                'valid': False,
                'match': False,
                'confidence': 0,
                'error': str(watermark_error)
            }
        
        # Level 3: Perceptual hash comparison (placeholder - would need reference pHash)
        verification_results['verification_levels']['perceptual_hash'] = {
            'method': 'pHash',
            'available': False,
            'note': 'Requires reference pHash for comparison'
        }
        
        # Determine overall result
        max_confidence = max([
            level.get('confidence', 0) 
            for level in verification_results['verification_levels'].values()
            if isinstance(level, dict)
        ])
        
        verification_results['confidence'] = max_confidence
        if max_confidence >= 80:
            verification_results['overall_result'] = 'verified'
        elif max_confidence >= 50:
            verification_results['overall_result'] = 'partial'
        else:
            verification_results['overall_result'] = 'unverified'
        
        return jsonify(verification_results)
        
    except Exception as e:
        print(f"Verification error: {e}")
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("🛡️ Starting PhotoMint Watermarking Service...")
    print(f"📊 Method: {WATERMARK_METHOD}")
    print(f"📦 Max Payload Size: {MAX_PAYLOAD_SIZE} bytes")
    print(f"🔧 Version: {VERSION}")
    
    # Run the server on port 5001 (avoid conflict with macOS AirPlay)
    app.run(host='0.0.0.0', port=5001, debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
from PIL import Image
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)

def embed_watermark(image_data, watermark_text="PhotoMint"):
    """
    Embed an invisible watermark into an image using LSB technique
    """
    try:
        # Convert base64 to PIL Image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Simple LSB watermarking for demo
        watermark_bits = ''.join(format(ord(char), '08b') for char in watermark_text)
        watermark_bits += '1111111111111110'  # End marker
        
        # Embed watermark in least significant bits
        bit_index = 0
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                for k in range(3):  # RGB channels
                    if bit_index < len(watermark_bits):
                        # Modify LSB
                        img_array[i, j, k] = (img_array[i, j, k] & 0xFE) | int(watermark_bits[bit_index])
                        bit_index += 1
                    else:
                        break
                if bit_index >= len(watermark_bits):
                    break
            if bit_index >= len(watermark_bits):
                break
        
        # Convert back to PIL Image
        watermarked_image = Image.fromarray(img_array)
        
        # Convert to base64
        buffer = io.BytesIO()
        watermarked_image.save(buffer, format='JPEG', quality=95)
        watermarked_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/jpeg;base64,{watermarked_b64}"
        
    except Exception as e:
        print(f"Error in embed_watermark: {str(e)}")
        return None

def extract_watermark(image_data):
    """
    Extract watermark from an image
    """
    try:
        # Convert base64 to PIL Image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Extract watermark from LSBs
        extracted_bits = []
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                for k in range(3):  # RGB channels
                    extracted_bits.append(str(img_array[i, j, k] & 1))
                    
                    # Check for end marker
                    if len(extracted_bits) >= 16:
                        if ''.join(extracted_bits[-16:]) == '1111111111111110':
                            # Found end marker, extract the message
                            message_bits = extracted_bits[:-16]
                            if len(message_bits) % 8 == 0:
                                message = ''
                                for i in range(0, len(message_bits), 8):
                                    byte = ''.join(message_bits[i:i+8])
                                    message += chr(int(byte, 2))
                                return message
                            return None
        
        return None
        
    except Exception as e:
        print(f"Error in extract_watermark: {str(e)}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'PhotoMint Watermark Service',
        'version': '1.0.0'
    })

@app.route('/embed', methods=['POST'])
def embed_watermark_endpoint():
    """Embed watermark endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        watermark_text = data.get('watermark', 'PhotoMint')
        
        watermarked_image = embed_watermark(image_data, watermark_text)
        
        if watermarked_image:
            return jsonify({
                'success': True,
                'watermarked_image': watermarked_image,
                'message': 'Watermark embedded successfully'
            })
        else:
            return jsonify({'error': 'Failed to embed watermark'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/extract', methods=['POST'])
def extract_watermark_endpoint():
    """Extract watermark endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        
        extracted_watermark = extract_watermark(image_data)
        
        if extracted_watermark:
            return jsonify({
                'success': True,
                'watermark': extracted_watermark,
                'message': 'Watermark extracted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'watermark': None,
                'message': 'No watermark found'
            })
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/verify', methods=['POST'])
def verify_watermark_endpoint():
    """Verify watermark endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        expected_watermark = data.get('expected', 'PhotoMint')
        
        extracted_watermark = extract_watermark(image_data)
        
        is_verified = extracted_watermark == expected_watermark
        
        return jsonify({
            'success': True,
            'verified': is_verified,
            'extracted_watermark': extracted_watermark,
            'expected_watermark': expected_watermark,
            'confidence': 100 if is_verified else 0
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Main route handler for Vercel
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if request.method == 'GET' and path == '':
        return health_check()
    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
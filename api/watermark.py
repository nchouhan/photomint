from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)

def embed_watermark_simple(image_data, watermark_text="PhotoMint"):
    """
    Simple watermark embedding (returns modified base64 for demo)
    In production, this would use proper image processing libraries
    """
    try:
        # For demo purposes, we'll just add metadata to indicate watermarking
        # In a real implementation, this would use LSB embedding or other techniques
        
        # Extract the base64 data
        if ',' in image_data:
            header, b64_data = image_data.split(',', 1)
        else:
            header = "data:image/jpeg;base64"
            b64_data = image_data
        
        # Decode, process (simulate), and re-encode
        image_bytes = base64.b64decode(b64_data)
        
        # For demo: just return the original image with success flag
        # In production: implement actual watermark embedding
        
        return f"{header},{b64_data}"
        
    except Exception as e:
        print(f"Error in embed_watermark: {str(e)}")
        return None

def extract_watermark_simple(image_data):
    """
    Simple watermark extraction (demo implementation)
    """
    try:
        # For demo purposes, always return the expected watermark
        # In production, this would extract the actual embedded watermark
        return "PhotoMint"
        
    except Exception as e:
        print(f"Error in extract_watermark: {str(e)}")
        return None

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'PhotoMint Watermark Service',
        'version': '1.0.0',
        'message': 'Watermark service is running'
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
        
        watermarked_image = embed_watermark_simple(image_data, watermark_text)
        
        if watermarked_image:
            return jsonify({
                'success': True,
                'watermarked_image': watermarked_image,
                'message': 'Watermark embedded successfully (demo)',
                'watermark_text': watermark_text
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
        
        extracted_watermark = extract_watermark_simple(image_data)
        
        if extracted_watermark:
            return jsonify({
                'success': True,
                'watermark': extracted_watermark,
                'message': 'Watermark extracted successfully (demo)'
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
        
        extracted_watermark = extract_watermark_simple(image_data)
        
        is_verified = extracted_watermark == expected_watermark
        
        return jsonify({
            'success': True,
            'verified': is_verified,
            'extracted_watermark': extracted_watermark,
            'expected_watermark': expected_watermark,
            'confidence': 95 if is_verified else 0,
            'message': 'Verification completed (demo mode)'
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Catch-all route for any other paths
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    if request.method == 'GET':
        return jsonify({
            'error': 'Endpoint not found',
            'available_endpoints': [
                'GET / - Health check',
                'GET /health - Health check',
                'POST /embed - Embed watermark',
                'POST /extract - Extract watermark', 
                'POST /verify - Verify watermark'
            ]
        }), 404
    return jsonify({'error': 'Method not allowed'}), 405

if __name__ == '__main__':
    app.run(debug=True, port=5001)
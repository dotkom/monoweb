from urllib.parse import urlparse

def extract_s3_key_from_url(url: str) -> str:
    """
    Extract the S3 key from an S3 URL.
    
    Example: 
    Input: "https://s3.eu-north-1.amazonaws.com/receipt-archive.online.ntnu.no/bilde.png"
    Output: "bilde.png"
    
    Args:
        url: The S3 URL to extract the key from
        
    Returns:
        The S3 key (path after bucket name)
    """
    parsed = urlparse(url)
    # Remove leading slash if present
    path = parsed.path.lstrip('/')
    # Split at first slash to separate bucket from key
    _, key = path.split('/', 1)
    return key


        
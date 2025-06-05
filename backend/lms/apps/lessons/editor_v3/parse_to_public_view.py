import json
def parse_to_public_view(content: str):
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON content")
    except Exception as e:
        raise ValueError(f"An error occurred while parsing JSON: {str(e)}")
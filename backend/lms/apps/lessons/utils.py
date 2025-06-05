def get_truncated_name(text: str, limit=25):
    """
    Truncate a string to a specified length, adding '...' if it exceeds the limit.

    Args:
        text (str): The string to truncate.
        limit (int): The maximum length of the string before truncation.

    Returns:
        str: The truncated string.
    """
    if len(text) > limit:
        return f"{text[:limit]}..."
    return text

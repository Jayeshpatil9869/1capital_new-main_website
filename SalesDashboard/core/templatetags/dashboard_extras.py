from django import template

register = template.Library()

@register.filter
def multiply(value, arg):
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0

@register.filter
def indian_number_format(value):
    """Format number in Indian numbering system with lakh and crore commas"""
    try:
        # Convert to int/float
        if isinstance(value, str):
            value = float(value)
        
        value = int(value)
        
        # If value is 0
        if value == 0:
            return '0'
        
        # Handle negative numbers
        is_negative = value < 0
        value = abs(value)
        
        # Convert to string
        value_str = str(value)
        
        # Indian format: 1,23,45,67,890
        # Groups from right: (3 digits), then (2 digits each)
        if len(value_str) <= 3:
            result = value_str
        else:
            # Split into groups: last 3 digits + then 2-digit groups from right
            last_3 = value_str[-3:]
            remaining = value_str[:-3]
            
            # Group remaining from right in pairs of 2
            groups = []
            for i in range(len(remaining), 0, -2):
                start = max(0, i - 2)
                groups.insert(0, remaining[start:i])
            
            result = ','.join(groups) + ',' + last_3
        
        return '-' + result if is_negative else result
    except (ValueError, TypeError):
        return str(value)

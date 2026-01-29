import re

def build_cmdline_regex_from_tokens(tokens, max_tokens=5):
    toks = list(tokens)[:max_tokens]
    if not toks:
        return None
    return '.*' + '.*'.join([re.escape(t) for t in toks]) + '.*'

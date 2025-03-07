"""
RUN THIS FILE IN ORDER TO AUTO IMPORT ALL MODULES IN CURRENT FOLDER.
"""
import os

filedir = os.path.dirname(__file__)
modules = [f[:-3] for f in os.listdir(filedir) if
           os.path.isfile(os.path.join(filedir, f)) and f.endswith('.py') and f != '__init__.py']
imports = [f"    from .{module} import *\n" for module in sorted(modules)]

with open(__file__, 'r') as f:
    this_script = list(f)[:19]

with open(__file__, 'w') as f:
    f.write(f"""{''.join(this_script)[:-1]}
try:
{''.join(imports)[:-1] if imports else '    pass'}
except ImportError:
    pass""")
try:
    from .__component_base import *
    from .__page_element import *
    from .audio_component import *
    from .blue_card_component import *
    from .fill_text_component import *
    from .image_component import *
    from .matching_component import *
    from .order_component import *
    from .question_component import *
    from .recording_component import *
    from .text_component import *
    from .video_component import *
except ImportError:
    pass
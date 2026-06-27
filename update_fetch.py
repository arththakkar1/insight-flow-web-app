import os

files = [
    'frontend/src/pages/Chat.jsx',
    'frontend/src/pages/Datasets.jsx',
    'frontend/src/pages/Reports.jsx',
    'frontend/src/components/DeleteModal.jsx'
]

for fpath in files:
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Add import
    import_stmt = "import { apiFetch } from '../utils/api';\n"
    if 'utils/api' not in content:
        content = import_stmt + content
        
    # Replace fetch( with apiFetch( ONLY for our api paths
    content = content.replace("fetch('http://localhost:8000/api/", "apiFetch('http://localhost:8000/api/")
    content = content.replace("fetch(`http://localhost:8000/api/", "apiFetch(`http://localhost:8000/api/")
    
    with open(fpath, 'w') as f:
        f.write(content)

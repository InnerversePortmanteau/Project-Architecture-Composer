import re
import os

def detect_project_type():
    """
    Attempts to autodetect the project type based on key files.
    Returns a suggested prefix and a description.
    """
    if os.path.exists('vite.config.js'):
        return 'VITE_', 'Vite'
    if os.path.exists('package.json'):
        with open('package.json', 'r') as f:
            content = f.read()
            if '"react-scripts"' in content:
                return 'REACT_APP_', 'Create React App (CRA)'
            if '"nuxt"' in content:
                return 'NUXT_', 'Nuxt'
    return 'CUSTOM_', 'Other (e.g., custom, or a different framework)'

def create_env_file_from_firebase_config():
    """
    Converts a Firebase web configuration snippet into environment variables
    for a .env file.

    This script is designed for developers who need to configure their
    frontend applications (Vite, Create React App, etc.) to use Firebase.
    It automates the process of extracting key-value pairs and formatting them
    with the correct prefix, such as VITE_, to be used as environment variables.
    This prevents hardcoding configuration values and supports different build systems.
    """
    print("Welcome to the Firebase config to .env converter.")
    print("This script will help you convert a Firebase JavaScript config snippet into")
    print("environment variables for your project's .env file.")
    print("-" * 60)
    print("Please paste the JavaScript snippet from the Firebase console.")
    print("When you are done, press Enter, then Ctrl+D (or Cmd+D on Mac) to finish input.\n")

    js_config_input = ""
    while True:
        try:
            line = input()
            js_config_input += line + "\n"
        except EOFError:
            break

    if not js_config_input.strip():
        print("\nNo input received. Exiting.")
        return

    # --- Autodetect and Prompt for Prefix ---
    detected_prefix, project_name = detect_project_type()
    print("-" * 60)
    print(f"Detected project type: {project_name}.")
    print(f"Suggested prefix for environment variables: {detected_prefix}")
    
    user_input = input("Press Enter to accept, or type a new prefix (e.g., FOO_): ").strip()
    prefix = user_input if user_input else detected_prefix
    
    if not prefix.endswith('_'):
        prefix += '_'
    
    print(f"Using prefix: {prefix}\n")
    print("-" * 60)

    # Regex to find the firebaseConfig object and extract key-value pairs
    config_pattern = re.compile(r'const\s+firebaseConfig\s*=\s*\{([^}]+)\};', re.DOTALL)
    match = config_pattern.search(js_config_input)

    if not match:
        print("\nError: Could not find 'const firebaseConfig = {...}' in the input.")
        return

    config_content = match.group(1)
    
    # Extract individual key-value pairs
    key_value_pattern = re.compile(r'\s*(\w+):\s*(".*?"|\d+)\s*,?', re.DOTALL)
    matches = key_value_pattern.findall(config_content)
    
    if not matches:
        print("\nError: Could not parse key-value pairs from the configuration.")
        return

    # Construct the path to the .env file
    env_file_path = os.path.join(os.getcwd(), '.env')
    
    # Read existing .env file to avoid overwriting existing keys
    existing_env_vars = {}
    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    existing_env_vars[key] = value

    new_env_vars = []
    for key, value in matches:
        env_key = f"{prefix}{key.upper()}"
        if env_key not in existing_env_vars:
            new_env_vars.append(f'{env_key}={value}')
            
    if not new_env_vars:
        print("\nNo new Firebase configuration variables to add. All keys already exist in .env.")
        return
        
    print("\nSuccessfully parsed Firebase configuration.")
    print("The following new variables will be added to your .env file:")
    for var in new_env_vars:
        print(f"  - {var}")

    try:
        with open(env_file_path, 'a') as f:
            f.write("\n# Firebase Configuration added by script\n")
            for var in new_env_vars:
                f.write(var + "\n")
        print(f"\nSuccess! New variables have been added to {env_file_path}")
    except Exception as e:
        print(f"\nError: Failed to write to .env file. Reason: {e}")

if __name__ == "__main__":
    create_env_file_from_firebase_config()
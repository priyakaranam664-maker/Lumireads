import subprocess
import json
import sys

try:
    with open("deploy_env.json", "r", encoding="utf-8") as f:
        env_data = json.load(f)

    env_string = json.dumps(env_data)

    print("Deploying to InsForge via Python subprocess with shell=True...")
    # By running with shell=True on Windows, we execute through cmd.exe which respects wrapped double quotes
    result = subprocess.run(["npx", "@insforge/cli", "deployments", "deploy", "--env", env_string, "."], capture_output=True, text=True, shell=True)
    
    print("STDOUT:")
    print(result.stdout)
    print("STDERR:")
    print(result.stderr)
    
    if result.returncode != 0:
        raise Exception(f"Deployment process failed with exit code: {result.returncode}")
        
    print("Deployment completed successfully!")
except Exception as e:
    print("Deployment failed:", e)
    sys.exit(1)

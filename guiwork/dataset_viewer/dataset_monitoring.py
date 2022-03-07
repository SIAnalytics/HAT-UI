import os
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--pid", required = True)

def main(args):
    ret = {}

    # Check if process is alive
    try:
        os.kill(int(args.pid), 0)
    except OSError:
        ret["alive"] = False
    else:
        ret["alive"] = True

    print(json.dumps(ret))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)
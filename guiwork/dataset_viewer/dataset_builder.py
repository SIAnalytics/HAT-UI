import os
import json
import argparse

parser = argparse.ArgumentParser()

parser.add_argument("--video_path", required = True)
parser.add_argument("--train_rate", required = True)
parser.add_argument("--validation_rate", reuired = True)
parser.add_argument("--test_rate", required = True)
parser.add_argument("--shuffle", required = True)
parser.add_argument("--output_path", required = True)
parser.add_argument("--augmentation", required = True)

def main(args):
    print("Rnning dataset building")

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)

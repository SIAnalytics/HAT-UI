import os
import json
import argparse

from tensorboard.backend.event_processing import event_accumulator

parser = argparse.ArgumentParser()
parser.add_argument("--experiment_id", required = True)
parser.add_argument("--pid", required = True)
parser.add_argument("--last_epoch", required = True)
parser.add_argument("--log_path", required = True)
parser.add_argument("--epoch_count", required = True)

def main(args):
    ret = {}

    last_epoch = int(args.last_epoch)
    epoch_count = int(args.epoch_count)

    # Chaeck if process is alive
    try: 
        os.kill(int(args.pid), 0)
    except OSError:
        ret["alive"] = False
    else:
        ret["alive"] = True
    
    ret["scalars"] = {}

    # Find events file in directory
    log_file = ""
    if os.path.exists(args.log_path):
        for file in os.listdir(args.log_path):
            if file.startswith("events.out.tfevents"):
                log_file = os.path.join(args.log_path, file)
                break

    curr_epoch = last_epoch

    last_scalar_step = 0

    if log_file != "":
        # Get data from tensorflow
        ea = event_accumulator.EventAccumulator(log_file)
        ea.Reload()
        tags = ea.Tags()['scalars']

        # Get current epoch
        for tag in tags:
            runtime_scalars = ea.Scalars(tag)
            curr_epoch = max(curr_epoch, len(runtime_scalars))

        if curr_epoch > last_epoch:
            for tag in tags:
                runtime_scalars = ea.Scalars(tag)

                scalar_info = {}

                for i in range(len(runtime_scalars)):
                    scalar_info[runtime_scalars[i].step] = runtime_scalars[i].value

                ret["scalars"][tag] = scalar_info

    ret["progress"] = int(curr_epoch * 100 / epoch_count)
    ret["last_epoch"] = curr_epoch
    ret["log_file"] = log_file
    ret["log_path"] = args.log_path

    print(json.dumps(ret))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)
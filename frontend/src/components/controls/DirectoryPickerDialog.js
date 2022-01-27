import React from "react";
import Tree from '@naisutech/react-tree'
import axios from "axios";
import config from 'react-global-configuration';

class DirectoryPickerDialog extends React.Component{
    constructor(props) {
        super(props);
        this.props = props;
        this.data = [];
        this.dir_img = <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAB90lEQVRoge2WO08UURSAvzM77iPsQgJY8SgsjJ2N2klLbClsDf9CGhR+ADT2amJlZWJjIo0dkVjAkmCg0tgaEiQmwLKHYhiy7OzI3Mk+zsb7VfeeeZ1vzpk7Fzwej8fzPyOdgvqOaRqsA/NALdOdlBVZ5GUXc8tEQuAy+W1g3PluA5AIEpHozbsnDyC80NeDFojaJj99lki20Bu0Xw+/gT8In2nyXBY5SDupUwWsUENZQNjUt0ylnWRZIGYcZS3t4DAIwD++y2ERGEs7MCwCqYTOV4jA5ASMjcKtYsq/vPvoV/4CW8CyPPr+JY47VkBgZhpuT0Kxf8lfUgHmgA3duvskDroJjFahOtLlvJwJ0eCVapS7m0Ct2pOMcnCHzXuz4CpQLvckm1wUwnNwERCJ+t4CyjEPd3+Bi0CpFElYQKiLRHs2NwErKDvxMLtA2ZBAIPWrYeaLLAk0JU8FDK1Ap4XdeJhNIAyhUOhZPo78lMf1w3iSTcDSByzUW6fZBCqGBFpWIMhcAUP9r3kqYKqFAscKiEDJyBYCTggq+62BmwVKRTtbCHRPHnw7a410Eji6NrO0/iPb7ZGkgLBxbW6p/1U+tIc6VWAJ+H01syPwiR97H9uDCQF5xj7CfeA9cDTQPZACjcYhTVZpHC/IU84Hl4zH4/F4LHIB3RVfydN5JmcAAAAASUVORK5CYII="/>;
        this.file_img = <img src="data:image/png;base64,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"/>;
    }

    state = {
        data: []
    };

    // Directory IDs: 0, 1, 2,...
    // File IDs: strinf (full path)
    onSelect = selectedNode => {
        var url = config.get("django_url" + "/common/rest");
        
        //console.log(selectedNode[0]);
        if (selectedNode[0] > 0) {
            // Check if it's directory or file
            if (Number.isInteger(selectedNode[0])) {
                // Process directory update
                var full_path = this.state.data[selectedNode[0]]["path"];
                var next_id = this.state.data.length + 1;
                
                var url = config.get("django_url") + "/common/rest";
                
                axios
                    .get(url, { params: { req: "GET_DIRECTORY_CONTENT", path: full_path, parent: selectedNode[0], next_id: next_id } })
                    .then((res) => {
                        var files = res.data.files;
                        var dirs = res.data.dirs;
                        let curr_data = JSON.parse(JSON.stringify(this.state.data));
                    
                        for (var i = 0; i < files.length; i++) {
                            curr_data[selectedNode[0]].items.push(files[i]);
                        }

                        for (var i = 0; i < dirs.length; i++) {
                            curr_data.push(dirs[i]);
                        }

                        this.setState({data: curr_data});
                    })
                    .catch((err) => alert(err));
            } else {
                // Selected node is file
                // No extra actions required
            }
        }
    }

    componentDidMount() {
        // Get directory structure from Django
        //var url = config.get("django_url") + "/common/rest";
        var url = config.get("django_url") + "/common/rest";
        axios
            .get(url, { params: { req: "GET_ROOT_CONTENT" } })
            .then((res) => {
                this.setState({data: res.data});
            })
            .catch((err) => alert(err));
    }
    
    render() {
        return (
            <>
                <div className='directory-picker'>
                    <Tree 
                        nodes={this.state.data} 
                        onSelect={this.onSelect} 
                        theme="light"
                        IconRenderer = {({label}) => {
                            return label === 'leaf' | 'node' ? this.file_img : this.dir_img
                        }}/>
                </div>
            </>
        );
    }
}

export {
    DirectoryPickerDialog
};
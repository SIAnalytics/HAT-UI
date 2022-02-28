import React from "react";
import axios from "axios";

import { 
    DirectoryPicker,
    TableComponent
} from "./common";

import {
    Form,
} from 'react-bootstrap';

import {
    DatasetContext
} from "../DatasetContext";
import config from 'react-global-configuration';

import {
    SetGraphData
} from "./dv_13"

class DV_123456 extends React.Component {
    static contextType = DatasetContext;
    
    constructor (props) {
        super(props);
    }

    state = {
        content: []
    }

    OnDirectoryChange = (val) => {
        this.context.DatasetState.video_path = val;

        var url = config.get("django_url") + config.get("dataset_viewer_rest");

        axios
            .get(url, {
                params: {
                    req: "GET_VIDEOS_FROM_PATH",
                    path: val
                }
            })
            .then((res) => {
                var state = {
                    content: res.data.video_info
                }

                this.setState(state);

                SetGraphData(res.data.class_info, res.data.frame_info);
            })
            .catch((err) => alert(err));
    }

    HandleTypeChange = (e) => {
        this.context.DatasetState.type = e.target.value;
    }

    render() {
        let columns = [
            {
                dataField: '파일 이름',
                text: '파일 이름',
                sort: true,
                headerStyle: (colum, colIndex) => {
                    return { width: '50%' };
                }
            },
            {
                dataField: '객체 수',
                text: '객체 수',
                sort: true
            },
            {
                dataField: '비디오 길이',
                text: '비디오 길이, s',
                sort: true
            }
        ];

        let key_name = '파일 이름';

        return (
            <>
                <h5><b>영상 파일</b></h5>
                <DirectoryPicker 
                    onChange={this.OnDirectoryChange.bind(this)}
                    name="열기" 
                />
                
                <Form.Group style={{marginTop: 10}} className="w-100 d-flex">
                    <Form.Select className="w-100" onChange={this.HandleTypeChange.bind(this)}>
                        <option value="">타입 선텍</option>
                        <option value="TOI">TOI</option>
                        <option value="MOT">MOT</option>
                        <option value="FairMOT">FairMOT</option>
                        <option value="COCO">COCO</option>
                    </Form.Select>
                </Form.Group>

                <div style={{height: 509, overflowY: "scroll", marginTop: 10}}>
                    <TableComponent content={this.state.content} columns={columns} key_name = {key_name}/>
                </div>
            </>
        );
    }
}

export default DV_123456;
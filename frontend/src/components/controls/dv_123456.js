import React from "react";
import axios from "axios";

import {
    DirectoryPicker,
    TableComponent
} from "./common";

import {
    Spinner,
    Overlay,
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

    constructor(props) {
        super(props);
    }

    state = {
        content: [],
        spinner_hidden: true
    }

    OnDirectoryChange = (val) => {
        this.props.setVideoPath(val)

        var state = {
            spinner_hidden: false
        }
        this.setState(state);

        var url = config.get("django_url") + config.get("dataset_viewer_rest");

        axios
            .get(url, {
                params: {
                    req: "GET_VIDEOS_FROM_PATH",
                    path: val
                }
            })
            .then((res) => {
                state = {
                    content: res.data.video_info,
                    spinner_hidden: true
                }

                this.setState(state);
                this.props.setVideoCount(res.data.video_info.length)

                SetGraphData(res.data);
            })
            .catch((err) => alert(err));
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

                <div style={{ height: 663, overflowY: "scroll", marginTop: 10 }}>
                    <TableComponent content={this.state.content} columns={columns} key_name={key_name} />
                    <Spinner hidden={this.state.spinner_hidden} className="load-spinner" animation="border" variant="primary" size="lg" />
                </div>

            </>
        );
    }
}

export default DV_123456;
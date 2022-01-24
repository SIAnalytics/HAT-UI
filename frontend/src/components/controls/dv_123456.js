import React from "react";
import { 
    DirectoryPicker,
    TableComponent
} from "./common";

class DV_123456 extends React.Component {
    constructor (props) {
        super(props);
    }

    render() {
        let columns = [
            {
                dataField: '파일 이름',
                text: '파일 이름',
                sort: true
            },
            {
                dataField: '객체 수',
                text: '객체 수',
                sort: true
            },
            {
                dataField: '비디오 ID',
                text: '비디오 ID',
                sort: true
            }
        ];

        let content = [
            {
                '파일 이름': "Video_1_0000001_.png",
                '객체 수': 3,
                '비디오 ID': 1
            },
            {
                '파일 이름': "Video_1_0000002_.png",
                '객체 수': 0,
                '비디오 ID': 1
            },
            {
                '파일 이름': "Video_1_0000003_.png",
                '객체 수': 0,
                '비디오 ID': 1
            }
        ];

        let key_name = '파일 이름';

        return (
            <>
                <h5><b>영상 파일</b></h5>
                <DirectoryPicker name="열기" />
                <DirectoryPicker style={{marginTop: 10}} name="타입" />

                <div style={{height: 400, overflowY: "scroll", marginTop: 10}}>
                    <TableComponent content={content} columns={columns} key_name = {key_name}/>
                </div>
            </>
        );
    }
}

export default DV_123456;
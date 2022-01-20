import React from "react";

class TR_1 extends React.Component{
    constructor(props) {
        super(props);
    }

    OpenDirectoryPicker() {
        console.log("Open modal dialog");
    }

    render() {
        return (
            <>
                <div className="input-group">
                    <button className="btn btn-primary btn-sm" onClick={this.OpenDirectoryPicker}>데이터셋 열기</button>
                    <input type="text" className="input-lg"></input>
                </div>
            </>
        );
    }
}

export default TR_1;
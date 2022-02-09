import React, { useContext } from "react";
import { TrainerContext } from '../TrainerContext';

import {
    DirectoryPicker,
} from './common';

class TR_1 extends React.Component{
    static contextType = TrainerContext;

    constructor(props) {
        super(props);
      /*  this.context = TrainerContext;
        const { state, dispatch } = useContext(this.context);
        console.log(state);*/
    }

    onChange = (val) => {
        this.context.TrainerState.dataset_path = val;
    }

    render() {
        //console.log(this.context);
        return (
            <>
                <DirectoryPicker 
                    onChange={this.onChange.bind(this)}
                    name="데이터셋 열기" 
                />
            </>
        );
    }
}


export default TR_1;
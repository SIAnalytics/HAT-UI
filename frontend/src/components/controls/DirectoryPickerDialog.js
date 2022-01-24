import React from "react";

import {
    Modal,
    Button
} from "react-bootstrap";

class DirectoryPickerDialog extends React.Component{
    constructor(props) {
        super(props);
        this.props = props;
        this.show = props["show"];
        this.onHide = props["onHide"];
    }

    componentDidUpdate(props) {
        this.show = props["show"];
    }

    render() {
        return (
            <>
                <Modal
                    show={this.show}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Modal heading
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Centered Modal</h4>
                        <p>
                            Directory tree
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={ this.props.onHide }>Close</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export {
    DirectoryPickerDialog
};
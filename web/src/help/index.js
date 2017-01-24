import React from 'react';
import { connect } from 'react-redux';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { performSupport } from '../actions/support';
import './index.css';

const Help = class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: ''
        };
    }

    handleChange(event) {
        const message = event.target.value;
        this.setState({ message });
    }

    handleSubmit(e) {
        e.preventDefault();
        const { message } = this.state;
        const { storeId, performSupport } = this.props;
        if (message !== '') {
          performSupport({ message, storeId });
        }
    }

    render() {
        const { params: { storeId } } = this.props;
        return <Page title="Help"
          storeId={storeId}>
            <form className="help" onSubmit={(e) => this.handleSubmit(e)}>
                <h2>Having problems?</h2>
                <p>
                    <textarea rows="8"
                        name="emailAddress"
                        placeholder="We've automatically captured your account details, please just need to describe your problem here"
                        onChange={(e) => this.handleChange(e)}/>
                </p>
                <p><Button onClick={(e) => this.handleSubmit(e)}>Send to Customer Support</Button></p>
            </form>
        </Page>;
    }
};


const mapStateToProps = (_, { params: { storeId } }) => ({ storeId });

const mapDispatchToProps = { performSupport };

export default connect(mapStateToProps, mapDispatchToProps)(Help);

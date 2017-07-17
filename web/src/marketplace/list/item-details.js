import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import history from '../../history';

const FormElement = ({
  id,
  placeholder,
  description,
  value,
  type,
  onChangeHandler,
  fullWidth = true,
  ...other
}) => (
  <p className="my3">
    <label className="bold" htmlFor={id}>
      {description}
    </label>
    <input
      id={id}
      placeholder={placeholder}
      onChange={onChangeHandler}
      value={value}
      className={`input ${fullWidth ? '' : 'block col-4'}`}
      noValidate
      type={type}
      {...other}
    />
  </p>
);

class MarketplaceAddItemDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      qualifier: '',
      quantity: '',
      totalPaid: '',
      validity: 'not-submitted'
    };
  }

  handleStateUpdate(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  render() {
    const { validity, name, qualifier, quantity, totalPaid } = this.state;

    return (
      <Full left={<BackToPage path="/profile" title="Back" />}>
        <div className="left-align">
          <h2 className="regular center">Item details</h2>
          <form className="px2 navy" onSubmit={e => this.handleSubmit(e)}>
            {validity === 'invalid' &&
              <p className="red">Please fill out all required fields</p>}
            <FormElement
              id="name"
              description="Item name"
              placeholder="Walkers"
              onChangeHandler={e => this.handleStateUpdate(e)}
              value={name}
            />
            <FormElement
              id="qualifier"
              description={
                <span>Qualifier <span className="aqua">(optional)</span></span>
              }
              placeholder="Salt & Vinegar"
              onChange={e => this.handleStateUpdate(e)}
              value={qualifier}
            />
            <FormElement
              id="quantity"
              description="How many would you like to sell?"
              placeholder="10"
              onChange={e => this.handleStateUpdate(e, 'number')}
              value={quantity}
              type="number"
              min="1"
              step="any"
              fullWidth={false}
            />
            <FormElement
              id="totalPaid"
              description="How much did you pay in total (£)?"
              placeholder="3.00"
              onChange={e => this.handleStateUpdate(e, 'number')}
              value={totalPaid}
              fullWidth={false}
            />
          </form>
          <p className="my3 center">
            <Link
              className="btn btn-primary btn-big"
              onClick={() => {
                const validity = name.length !== 0 &&
                  quantity.length !== 0 &&
                  totalPaid.length !== 0
                  ? 'valid'
                  : 'invalid';
                this.setState({ validity });

                if (validity === 'valid') {
                  const qualifierPath = qualifier ? '/qualifier' : '';
                  history.push(
                    `/more/list/pricing/${name}${qualifierPath}/${quantity}/${Number(totalPaid) * 100}`
                  );
                }
              }}
            >
              Continue
            </Link>
          </p>
        </div>
      </Full>
    );
  }
}

const mapStateToProps = ({ store: { code } }) => ({ storeCode: code });

export default connect(mapStateToProps)(MarketplaceAddItemDetails);

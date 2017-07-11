import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performMarketplace } from '../../actions/marketplace';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';

const ourFees = 0.1;

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
    <label className={`left-align block bold`} htmlFor={id}>
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

class MarketplaceItemAdd extends React.Component {
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

  handleSubmit(event) {
    event.preventDefault();

    const { performMarketplace, storeCode } = this.props;
    const { name, qualifier, quantity, totalPaid } = this.state;

    const validity = name.length && totalPaid.length && quantity.length
      ? 'valid'
      : 'invalid';

    this.setState({ validity });

    if (validity === 'valid') {
      performMarketplace({
        storeCode,
        name,
        qualifier,
        totalPaid,
        quantity
      });
    }
  }

  calculatePerItemCost() {
    const price = Number(this.state.totalPaid);
    const quantity = Number(this.state.quantity);
    const result = price / quantity * (1 + ourFees);

    return !Number.isFinite(result) ? `` : `£${result.toFixed(2)}`;
  }

  render() {
    const { validity } = this.state;

    return (
      <Full left={<BackToPage path="/more" title="& more" />}>
        <form className="center px2 navy" onSubmit={e => this.handleSubmit(e)}>
          <p>Please fill in the details for your items</p>
          {validity === 'invalid' &&
            <p className="red">Please fill out every field</p>}
          <FormElement
            id="name"
            description="Item name"
            placeholder="Walkers"
            onChangeHandler={e => this.handleStateUpdate(e)}
            value={this.state.name}
          />
          <FormElement
            id="qualifier"
            description={
              <span>Qualifier <span className="aqua">(optional)</span></span>
            }
            placeholder="Salt & Vinegar"
            onChange={e => this.handleStateUpdate(e)}
            value={this.state.qualifier}
          />
          <FormElement
            id="quantity"
            description="How many would you like to sell?"
            placeholder="10"
            onChange={e => this.handleStateUpdate(e)}
            value={this.state.quantity}
            type="number"
            min="1"
            step="any"
            fullWidth={false}
          />
          <FormElement
            id="totalPaid"
            description="How much did you pay in total (£)?"
            placeholder="3.00"
            onChange={e => this.handleStateUpdate(e)}
            value={this.state.totalPaid}
            fullWidth={false}
          />
          <p className="my3">
            <Link
              className="btn btn-primary btn-big"
              onClick={e => this.handleSubmit(e)}
            >
              Submit item
            </Link>
          </p>
        </form>
      </Full>
    );
  }
}

const mapStateToProps = ({ store: { code } }) => ({ storeCode: code });

export default connect(mapStateToProps, { performMarketplace })(
  MarketplaceItemAdd
);

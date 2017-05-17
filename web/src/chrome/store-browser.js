import React from 'react';
import { Link } from 'react-router';

const extractStoreCode = url => {
  const [storeCode] = url.match(/([^/]*)$/);
  return storeCode === 'honesty.store' ? '' : storeCode;
};

const setCursorPosition = element => () => {
  requestAnimationFrame(() => {
    element.selectionStart = element.selectionEnd = element.value.length;
  });
};

class StoreBrowser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeCode: ''
    };
  }

  handleStoreCodeChange(event) {
    const { value } = event.target;
    const storeCode = extractStoreCode(value);
    this.setState(
      {
        storeCode: `https://honesty.store/${storeCode}`
      },
      setCursorPosition(event.target)
    );
  }

  openStore(e) {
    e.preventDefault();
    const { onSubmit } = this.props;
    const storeCode = extractStoreCode(this.state.storeCode);
    if (storeCode !== '') {
      onSubmit(storeCode);
    }
  }

  render() {
    const { storeCode } = this.state;
    const { buttonText, storePlaceholder } = this.props;
    return (
      <form onSubmit={e => this.openStore(e)}>
        <p>
          <input
            className="input"
            name="storeCode"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            value={storeCode}
            type="text"
            placeholder={`https://honesty.store/${storePlaceholder}`}
            onFocus={e => this.handleStoreCodeChange(e)}
            onChange={e => this.handleStoreCodeChange(e)}
          />
        </p>
        <p>
          <Link className="btn btn-primary" onClick={e => this.openStore(e)}>
            {buttonText}
          </Link>
        </p>
      </form>
    );
  }
}

export default StoreBrowser;

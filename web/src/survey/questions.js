import React from 'react';
import Swipeable from 'react-swipeable';
import { connect } from 'react-redux';
import Full from '../layout/full';
import { Back } from '../chrome/link';
import SurveyItem from './item';
import { submitSurvey } from '../actions/survey';

class Survey extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      answers: [],
      outro: false,
      delta: 0
    };
  }

  next() {
    const { survey, submitSurvey } = this.props;
    const { index, answers } = this.state;
    const nextIndex = index + 1;

    if (nextIndex >= survey.questions.length) {
      submitSurvey({ survey, answers });
      return;
    }

    this.setState({
      outro: false,
      delta: 0,
      index: nextIndex
    });
  }

  choose(itemIndex) {
    const { survey: { questions } } = this.props;
    const { index, answers } = this.state;
    this.setState({
      answers: [...answers, questions[index][itemIndex].id],
      outro: true
    });
    setTimeout(() => this.next(), 1000);
  }

  swipedLeft() {
    const { delta, outro } = this.state;
    if (outro) {
      return;
    }
    this.setState({
      delta: delta !== 0 ? delta : -1
    });
    this.choose(0);
  }

  swipedRight() {
    const { delta, outro } = this.state;
    if (outro) {
      return;
    }
    this.setState({
      delta: delta !== 0 ? delta : 1
    });
    this.choose(1);
  }

  swipingLeft(delta) {
    const { outro } = this.state;
    if (outro) {
      return;
    }
    this.setState({
      delta: -delta
    });
  }

  swipingRight(delta) {
    const { outro } = this.state;
    if (outro) {
      return;
    }
    this.setState({
      delta
    });
  }

  render() {
    const { survey: { questions } } = this.props;
    const { index, delta, outro } = this.state;
    const itemPair = questions[index];

    return (
      <Swipeable
        preventDefaultTouchmoveEvent={false}
        onSwipedLeft={() => this.swipedLeft()}
        onSwipedRight={() => this.swipedRight()}
        onSwipingLeft={(e, delta) => this.swipingLeft(delta)}
        onSwipingRight={(e, delta) => this.swipingRight(delta)}
      >
        <Full left={<Back />}>
          <h2>
            Question {this.state.index + 1} of {questions.length}
          </h2>
          <h1>
            Which will you save?
          </h1>
          <p>
            Swipe left or right to decide!
          </p>
          <div className="flex">
            <div className="col-6"
              onClick={() => this.swipedLeft()}
              onMouseEnter={() => this.swipingLeft(100)}
              onMouseLeave={() => this.swipingLeft(0)}>
              <SurveyItem
                item={itemPair[0]}
                delta={-delta}
                outro={outro}/>
            </div>
            <div className="col-6"
              onClick={() => this.swipedRight()}
              onMouseEnter={() => this.swipingRight(100)}
              onMouseLeave={() => this.swipingRight(0)}>
              <SurveyItem
                item={itemPair[1]}
                delta={delta}
                outro={outro} />
            </div>
          </div>
        </Full>
      </Swipeable>
    );
  }
};

const mapStateToProps = ({ survey }) => ({ survey });

export default connect(mapStateToProps, { submitSurvey })(Survey);

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Full from '../layout/full';
import { Back } from '../chrome/link';

const Index = ({ surveyAvailable, count }) =>
  <Full top={<Back />}>
    <h1>It's Come To This...<sup>*</sup></h1>
    <p>In the ages-old battle for space in your store, many fall and only the very strongest prosper.</p>
    <p>We're going to line up {count} pairs of items and it's up to you to <span className="underline">swipe left or right</span> to save your favourite item.</p>
    {
      surveyAvailable ?
        <Link to="survey/questions" className="btn btn-primary btn-big">Take the Challenge</Link> :
        <div to="survey/questions" className="btn bg-gray white btn-big">Not Available Right Now</div>
    }
    <p className="mt4 h6"><sup>*</sup>Actually, we already do our best to predict what you'd like to see in your store but sometimes it's nicer to ask...</p>
  </Full>;

const mapPropsToState = ({ survey }) => ({
  surveyAvailable: survey != null,
  count: survey != null ? survey.questions.length : ''
});

export default connect(mapPropsToState)(Index);
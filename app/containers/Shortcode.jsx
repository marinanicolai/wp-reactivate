import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as R from 'ramda';

export default class Shortcode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      featuresSubCategories: [],
      cuisine: '',
      currentPost: {}
    };
  }

  componentDidMount() {
    
    this.getCategories();
  }

  getCategories() {
    axios.get('http://nicolaimarina.com/wp-json/wp/v2/categories')
      .then(({ data }) => {
        this.setState({ categories: data });
        this.getCurrentPost();
      })
  }

  getCurrentPost() {
    let postId = this.props.wpObject.post_id;
    const { categories } = this.state;

    postId = 13110
    axios.get('http://nicolaimarina.com/wp-json/wp/v2/posts/' + postId)
    .then(({ data }) => {
      const currentPostCategoryIds = R.propOr([], 'categories', data);
      const currentPostCategories = currentPostCategoryIds.map(cat => categories.find(category => category.id === cat));

      this.setState({ currentPostCategories });
      this.getFeaturesSubcategories();
      this.getCuisineSubcategories();
    })
  }

  getFeaturesSubcategories() {
    const { currentPostCategories } = this.state;
    const [parentCategory] = currentPostCategories.filter(cat => R.propOr('', 'slug', cat) === 'features')
    const featuresSubCategories = currentPostCategories.filter(cat => cat !== parentCategory && cat.parent === parentCategory.id );
    
    if (featuresSubCategories.length) {
      this.setState({ featuresSubCategories })
    }
  }

  getCuisineSubcategories() {
    const { currentPostCategories } = this.state;
    const [parentCategory] = currentPostCategories.filter(cat => R.propOr('', 'slug', cat) === 'cuisine')
    const [cuisine] = currentPostCategories.filter(cat => cat !== parentCategory && cat.parent === parentCategory.id );
    
    this.setState({ cuisine: cuisine.slug })
  }

  render() {
    const assetPath = R.path(['props', 'wpObject', 'assetPath'], this);
    const { featuresSubCategories, cuisine } = this.state;

    return (
      <div className="recipe-category-block">
        <div className="recipe-features">
          <ul>
            { featuresSubCategories.map(category => (
              <li key={category.id}>
                <img src={`${assetPath}/img/${category.slug}.svg`}/>
              </li>
            )) }
          </ul>
        </div>
        <div className="recipe-cuisine">
          <span>cuisine:</span>
          <img src={`${assetPath}/img/${cuisine}.svg`}/>
        </div>
      </div>
    );
  }
}

Shortcode.propTypes = {
  wpObject: PropTypes.object
};
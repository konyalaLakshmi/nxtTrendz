// Write your code here
import {Component} from 'react'

import Cookies from 'js-cookie'

import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import {Link} from 'react-router-dom'

import Loader from 'react-loader-spinner'

import Header from '../Header'

import SimilarProductItem from '../SimilarProductItem'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  failure: 'FAILURE',
  success: 'SUCCESS',
}

class ProductItemDetails extends Component {
  state = {
    productData: {},
    similarProductsData: [],
    apiStatus: apiStatusConstants.initial,
    quantity: 1,
  }

  getFormattedData = data => ({
    id: data.id,
    availability: data.availability,
    brand: data.brand,
    totalReviews: data.total_reviews,
    price: data.price,
    imageUrl: data.image_url,
    rating: data.rating,
    title: data.title,
    description: data.description,
  })

  getProductData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({apiStatus: apiStatusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      console.log(fetchedData)
      const updatedData = this.getFormattedData(fetchedData)
      const updateSimilarProductsData = fetchedData.similar_products.map(each =>
        this.getFormattedData(each),
      )
      this.setState({
        productData: updatedData,
        similarProductsData: updateSimilarProductsData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoadingView = () => (
    <div className="loading-view-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        className="failure-view-img"
        alt="error view"
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
      />
      <h1 className="error-heading">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="error-button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prev => ({quantity: prev.quantity - 1}))
    }
  }

  onIncrementQuantity = () => {
    this.setState(prev => ({quantity: prev.quantity + 1}))
  }

  renderProductDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductDetailsView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  renderProductDetailsView = () => {
    const {productData, similarProductsData, quantity} = this.state
    const {
      availability,
      brand,
      description,
      imageUrl,
      price,
      rating,
      title,
      totalReviews,
    } = productData
    return (
      <div className="product-details-success-view">
        <div className="product-details-container">
          <img src={imageUrl} className="product-img" alt="product" />
          <div className="product">
            <h1 className="product-heading">{title}</h1>
            <p className="price-details">Rs {price}</p>
            <div className="rating-and-review">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  alt="star"
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  className="star"
                />
              </div>
              <p className="reviews-count">{totalReviews} Reviews</p>
            </div>
            <p className="product-description">{description}</p>
            <div className="label-value-container">
              <p className="label">Available</p>
              <p className="value">{availability}</p>
            </div>
            <div className="label-value-container">
              <p className="label">Brand</p>
              <p className="value">{brand}</p>
            </div>
            <hr className="horizontal-line" />
            <div className="quantity-container">
              <button
                type="button"
                className="quantity-controller-button"
                data-testid="minus"
                onClick={this.onDecrementQuantity}
                aria-label="Decrease Quantity"
              >
                <BsDashSquare className="quantity-controller-icon" />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                type="button"
                className="quantity-controller-button"
                data-testid="plus"
                onClick={this.onIncrementQuantity}
                aria-label="Increase Quantity"
              >
                <BsPlusSquare className="quantity-controller-icon" />
              </button>
            </div>
            <button type="button" className="add-to-cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul className="similar-products-list">
          {similarProductsData.map(each => (
            <SimilarProductItem details={each} key={each.id} />
          ))}
        </ul>
      </div>
    )
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-item-details-container">
          {this.renderProductDetails()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails

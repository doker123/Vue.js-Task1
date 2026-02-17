Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
      <div class="product">
        <div class="product-image">
          <img :src="image" :alt="altText"/>
        </div>

        <div class="product-info">
          <h1>{{ title }}</h1>
          <p v-if="inStock">In stock</p>
          <p v-else>Out of Stock</p>
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
          <p>Shipping: {{ shipping }}</p>
          <div
              class="color-box"
              v-for="(variant, index) in variants"
              :key="variant.variantId"
              :style="{ backgroundColor:variant.variantColor }"
              @mouseover="updateProduct(index)"
          ></div>

          <button
              v-on:click="addToCart"
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
          >
            Add to cart
          </button>
        </div>
        <product-tabs :reviews="reviews"
        :premium="premium"
        :details="details"
        :product="product"
        :brand="brand"
        :variants="variants"></product-tabs>
      </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    }
})

Vue.component ('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        premium: {
            type: Boolean,
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        product: {
            type: String,
            required: true
        },
        brand: {
            type:String,
            required: true
        },
        variants: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
      <ul>
        <span class="tab"
              v-for="(tab,index) in tabs"
              :key="index" @click="selectedTab = tab" :class="{ activeTab: selectedTab === tab }"
        >{{tab}}
        </span>
      </ul>
      <div v-show="selectedTab=== 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>{{ review.review }}</p>
          </li>
        </ul>
      </div>
      
      <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>
      </div>
      
      <div v-show="selectedTab === 'Shipping'" class="tab-content">
            <h3>Shipping Information</h3>
            <div class="shipping-info">
                <p><strong>Delivery Options:</strong></p>
                <ul>
                    <li>Standard Shipping (3-5 business days) - {{ shippingCost }}</li>
                    <li>Express Shipping (1-2 business days) - {{ expressShippingCost }}</li>
                    <li>Next Day Delivery - {{ nextDayShippingCost }}</li>
                </ul>
            </div>
        </div>
        
        <div v-show="selectedTab === 'Details'" class="tab-content">
            <h3>Product Details</h3>
            <div class="product-details">
                <p><strong>Product:</strong> {{ product }}</p>
                <p><strong>Brand:</strong> {{ brand }}</p>
                <p><strong>Available Colors:</strong></p>
                <div class="color-swatches">
                    <div v-for="variant in variants" 
                         class="color-swatch"
                         :style="{ backgroundColor: variant.variantColor }"
                         :title="variant.variantColor">
                    </div>
                </div>
                <p><strong>Materials:</strong></p>
                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>
            </div>
        </div>
    </div>
`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping','Details'],
            selectedTab: 'Reviews'
        }
    },
    computed: {
        shippingCost() {
            return this.premium ? "Free" : "2,99";
        },
        expressShippingCost() {
            return this.premium ? "$4.99" : "$7.99";
        },
        nextDayShippingCost() {
            return this.premium ? "$9.99" : "$14.99";
        }
    }
})

Vue.component('product-review', {
    template: `
<form class="review-form" @submit.prevent="onSubmit">

<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>

 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
 `,
    data() {

        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
            }
        }
    }
})

let eventBus = new Vue()

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        }
    }
})

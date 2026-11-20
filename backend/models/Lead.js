
const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address'
      ]
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },

    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true
    },

    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Converted'],
      default: 'New'
    }
  },
  {
    timestamps: true
  }
)

const Lead = mongoose.model('Lead', leadSchema)

module.exports = Lead

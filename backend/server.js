
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Lead = require('./models/Lead')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Home route
app.get('/', (req, res) => {
  res.status(200).send('Mini CRM Backend is Running!')
})

// 1. GET - Dashboard statistics
// Keep this route before /:id
app.get('/api/leads/stats', async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const counts = {
      total: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0
    }

    stats.forEach((item) => {
      counts.total += item.count

      const status = item._id.toLowerCase()

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] = item.count
      }
    })

    res.status(200).json(counts)
  } catch (error) {
    console.error('Stats Error:', error)

    res.status(500).json({
      message: 'Error fetching dashboard statistics'
    })
  }
})

// 2. GET - Fetch all leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 })

    res.status(200).json(leads)
  } catch (error) {
    console.error('Fetch Leads Error:', error)

    res.status(500).json({
      message: 'Error fetching leads'
    })
  }
})

// 3. POST - Create new lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !company?.trim()
    ) {
      return res.status(400).json({
        message: 'Please provide name, email, phone and company'
      })
    }

    const newLead = await Lead.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      status: status || 'New'
    })

    res.status(201).json({
      message: 'Lead added successfully',
      lead: newLead
    })
  } catch (error) {
    console.error('Create Lead Error:', error)

    res.status(400).json({
      message: error.message || 'Error adding lead'
    })
  }
})

// 4. GET - Fetch single lead
app.get('/api/leads/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid lead ID'
      })
    }

    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      })
    }

    res.status(200).json(lead)
  } catch (error) {
    console.error('Get Single Lead Error:', error)

    res.status(500).json({
      message: 'Error fetching lead'
    })
  }
})

// 5. PUT - Update existing lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid lead ID'
      })
    }

    const { name, email, phone, company, status } = req.body

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !company?.trim()
    ) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      })
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        status
      },
      {
        new: true,
        runValidators: true
      }
    )

    if (!updatedLead) {
      return res.status(404).json({
        message: 'Lead not found'
      })
    }

    res.status(200).json({
      message: 'Lead updated successfully',
      lead: updatedLead
    })
  } catch (error) {
    console.error('Update Lead Error:', error)

    res.status(400).json({
      message: error.message || 'Error updating lead'
    })
  }
})

// 6. DELETE - Delete existing lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid lead ID'
      })
    }

    const deletedLead = await Lead.findByIdAndDelete(req.params.id)

    if (!deletedLead) {
      return res.status(404).json({
        message: 'Lead not found'
      })
    }

    res.status(200).json({
      message: 'Lead deleted successfully'
    })
  } catch (error) {
    console.error('Delete Lead Error:', error)

    res.status(500).json({
      message: 'Error deleting lead'
    })
  }
})

// Server and MongoDB connection
const PORT = process.env.PORT || 5000

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing in backend/.env')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB Connection Error:', error.message)
    process.exit(1)
  })

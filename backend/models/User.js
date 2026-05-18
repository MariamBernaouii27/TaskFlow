const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Le nom est obligatoire.'],
      trim:     true
    },
    email: {
      type:      String,
      required:  [true, 'L\'email est obligatoire.'],
      unique:    true,
      lowercase: true,
      trim:      true
    },
    password: {
      type:     String,
      required: [true, 'Le mot de passe est obligatoire.'],
      minlength: 6
    }
  },
  { timestamps: true }
);

// Hash password avant enregistrement
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);

/*
dial chef de projet
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire']
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 6
  }
}, { timestamps: true });

// Hash password avant enregistrement
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
*/
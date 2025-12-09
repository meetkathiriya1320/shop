import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, addressStreet, addressCity, addressState, addressZip, addressCountry } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const userId = await User.create(name, email, password, 'user', addressStreet, addressCity, addressState, addressZip, addressCountry);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Return user details (excluding password)
        const userDetails = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            addressStreet: user.addressStreet,
            addressCity: user.addressCity,
            addressState: user.addressState,
            addressZip: user.addressZip,
            addressCountry: user.addressCountry,
            createdAt: user.createdAt
        };
        res.json({ message: 'Login successful', token, user: userDetails });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        // Since we're using JWT, logout is handled client-side by removing the token
        // This endpoint can be used to perform any server-side cleanup if needed
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { addressStreet, addressCity, addressState, addressZip, addressCountry } = req.body;
        const userId = req.user.id; // Assuming user ID is available from auth middleware

        // Update the user's address in the database
        const [result] = await pool.execute(
            'UPDATE users SET address_street = ?, address_city = ?, address_state = ?, address_zip = ?, address_country = ? WHERE id = ?',
            [addressStreet, addressCity, addressState, addressZip, addressCountry, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch updated user to return current address
        const updatedUser = await User.findById(userId);
        const userDetails = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            addressStreet: updatedUser.addressStreet,
            addressCity: updatedUser.addressCity,
            addressState: updatedUser.addressState,
            addressZip: updatedUser.addressZip,
            addressCountry: updatedUser.addressCountry,
            createdAt: updatedUser.createdAt
        };

        res.json({ message: 'Address updated successfully', user: userDetails });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Failed to save address: Unknown error.' });
    }
};

export const getShippingAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const shippingAddress = {
            addressStreet: user.addressStreet,
            addressCity: user.addressCity,
            addressState: user.addressState,
            addressZip: user.addressZip,
            addressCountry: user.addressCountry
        };

        res.json({ shippingAddress });
    } catch (error) {
        console.error('Get shipping address error:', error);
        res.status(500).json({ message: 'Failed to get shipping address' });
    }
};
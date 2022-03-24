// Import the nedded DB models
const { User, Thought } = require('../models');

const resolvers = {
    Query: {
        // This resolver runs when you query thoughts
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Thought.find(params).sort({ createdAt: -1 });
        },
        // This resolver runs when you query a single thought by its ID
        thought: async (parent, { _id }) => {
            return Thought.findOne({ _id });
        },
        // Get all users
        users: async () => {
            return User.find()
                .select('-__v -password') // Omit the mongoose specific -__v property and the user's password in the return data
                .populate('friends') // Ensure the associated friends data is returned
                .populate('thoughts'); // Ensure the associated thoughts data is returned
        },
        // Get a user by its username
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        }
    }
}
module.exports = resolvers;
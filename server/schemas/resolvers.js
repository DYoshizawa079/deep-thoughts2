// Import the nedded DB models
const { User, Thought } = require('../models');

// Import GraphQL's authentication error handler
const { AuthenticationError } = require('apollo-server-express');

// Import the function that generates the JWT token
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // 'context' param is where the Auth token is passed through
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({})
                    .select('-__v -password')
                    .populate('thoughts')
                    .populate('friends');
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
        // This resolver runs when you query thoughts
        thoughts: async (parent, { username }) => { //Note that {username} needs to be destructured because it seems to be imported as a JSON object
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
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if(!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return {token, user};
        },
        addThought: async (parents, args, context) => {
            if(context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username});

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { thoughts: thought._id }},
                    { new: true }
                );
                return thought;
            }
            throw new AuthenticationError('You need to be logged in');
        },
        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
              const updatedThought = await Thought.findOneAndUpdate(
                { _id: thoughtId },
                { $push: { reactions: { reactionBody, username: context.user.username } } },
                { new: true, runValidators: true }
              );
          
              return updatedThought;
            }
          
            throw new AuthenticationError('You need to be logged in!');
        },
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { friends: friendId } },
                { new: true }
              ).populate('friends');
          
              return updatedUser;
            }
          
            throw new AuthenticationError('You need to be logged in!');
        }
    }
}
module.exports = resolvers;
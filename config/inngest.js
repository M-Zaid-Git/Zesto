import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Zesto" });

// inngest function to save user data to database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
    },
    {event: 'clerk/user.created'},
    async ({event,step,db}) => {
        const { id, email_addresses, first_name, last_name, image_url } =
        event.data;

        const userData = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            imageUrl: image_url,
            cartItems: {},
        };
        await connectDB();
        await User.create(userData);
    }
)

// function to update user data in database
export const syncUserUpdated = inngest.createFunction(
    {
        id:'update-user-from-clerk',
    },
    {event: 'clerk/user.updated'},
    async ({event,step,db}) => {
        const { id, email_addresses, first_name, last_name, image_url } =
        event.data;

        const userData = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            imageUrl: image_url,
            cartItems: {},      
        }
        await connectDB();
        await User.findByIdAndUpdate(id, userData);
    }
)

// inngest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
    {
        id:'delete-user-from-clerk',
    },
    {event: 'clerk/user.deleted'},
    async ({event,step,db}) => {
        const { id } = event.data;
        await connectDB();
        await User.findByIdAndDelete(id);
    }
)
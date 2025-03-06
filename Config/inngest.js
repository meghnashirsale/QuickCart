import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        if (!email_addresses || email_addresses.length === 0) {
            console.error("Email address is missing.");
            return;
        }

        const userData = {
            _id: id,
            email: email_addresses[0], // Corrected email assignment
            name: `${first_name} ${last_name}`,
            imageUrl: image_url,
        };

        await connectDB();
        await User.create(userData);
    }
);

// Inngest function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        if (!email_addresses || email_addresses.length === 0) {
            console.error("Email address is missing.");
            return;
        }

        const userData = {
            email: email_addresses[0], // Removed _id since it's not needed for updates
            name: `${first_name} ${last_name}`,
            imageUrl: image_url,
        };

        await connectDB();
        await User.findByIdAndUpdate(id, userData, { new: true });
    }
);

// Inngest function to delete user from the database
export const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const { id } = event.data;

        if (!id) {
            console.error("User ID is missing.");
            return;
        }

        await connectDB();
        await User.findByIdAndDelete(id);
    }
);

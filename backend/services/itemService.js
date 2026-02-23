const Item = require('../models/Item');
const Vendor = require('../models/Vendor');

class ItemService {
    // Create item (vendor only)
    async createItem(vendorId, itemData) {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) throw new Error('Vendor not found');

        const item = await Item.create({
            vendor: vendorId,
            ...itemData
        });

        return item;
    }

    // Get items with pagination and search
    async getItems(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
                { brand: { $regex: filters.search, $options: 'i' } },
                { model: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.category) query.category = filters.category;
        if (filters.vendorId) query.vendor = filters.vendorId;
        if (filters.available !== undefined) query.available = filters.available;

        // Use aggregation to join with Vendor and sort by subscription status
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'vendor',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendorDetails'
                }
            },
            { $unwind: '$vendorDetails' },
            // Only show items from approved vendors
            { $match: { 'vendorDetails.approved': true } },
            {
                $sort: {
                    'vendorDetails.isSubscribed': -1,
                    'vendorDetails.subscriptionTier': -1,
                    createdAt: -1
                }
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                name: 1,
                                description: 1,
                                price: 1,
                                category: 1,
                                brand: 1,
                                model: 1,
                                year: 1,
                                transmission: 1,
                                fuelType: 1,
                                mileage: 1,
                                seatCount: 1,
                                condition: 1,
                                duration: 1,
                                warranty: 1,
                                color: 1,
                                vin: 1,
                                engineCapacity: 1,
                                features: 1,
                                previousOwners: 1,
                                available: 1,
                                vehicleType: 1,
                                imageUrl: 1,
                                stock: 1,
                                createdAt: 1,
                                vendor: {
                                    _id: '$vendorDetails._id',
                                    companyName: '$vendorDetails.companyName',
                                    isSubscribed: '$vendorDetails.isSubscribed',
                                    subscriptionTier: '$vendorDetails.subscriptionTier'
                                }
                            }
                        }
                    ]
                }
            }
        ];

        const results = await Item.aggregate(pipeline);
        const total = results[0].metadata[0]?.total || 0;
        const items = results[0].data || [];

        return {
            items,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    // Get vendor items
    async getVendorItems(vendorId, page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = { vendor: vendorId };

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
                { brand: { $regex: filters.search, $options: 'i' } },
                { model: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.category) query.category = filters.category;
        if (filters.available !== undefined) query.available = filters.available;

        const items = await Item.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);

        return {
            items,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    // Get item by ID
    async getItemById(itemId) {
        const item = await Item.findById(itemId).populate('vendor');
        if (!item) throw new Error('Item not found');
        return item;
    }

    // Update item (vendor only)
    async updateItem(itemId, vendorId, updateData) {
        const item = await Item.findById(itemId);
        if (!item) throw new Error('Item not found');

        if (item.vendor.toString() !== vendorId) {
            throw new Error('Unauthorized to update this item');
        }

        // Only vendor can update certain fields
        const allowedFields = ['name', 'description', 'price', 'category', 'vehicleType', 'available', 'imageUrl', 'stock', 'brand', 'model', 'year', 'transmission', 'fuelType', 'mileage', 'seatCount', 'condition', 'duration', 'warranty', 'color', 'vin', 'engineCapacity', 'features', 'previousOwners'];
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                item[key] = updateData[key];
            }
        });

        await item.save();
        return item;
    }

    // Delete item (vendor only)
    async deleteItem(itemId, vendorId) {
        const item = await Item.findById(itemId);
        if (!item) throw new Error('Item not found');

        if (item.vendor.toString() !== vendorId) {
            throw new Error('Unauthorized to delete this item');
        }

        await Item.deleteOne({ _id: itemId });
        return { message: 'Item deleted successfully' };
    }

    // Get featured items
    async getFeaturedItems(limit = 6) {
        const visibleVendors = await Vendor.find({ approved: true }).select('_id');
        const visibleVendorIds = visibleVendors.map(v => v._id);

        return await Item.find({ 
            available: true,
            vendor: { $in: visibleVendorIds }
        })
            .populate('vendor', 'companyName')
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    // Search items by text
    async searchItems(searchTerm, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const visibleVendors = await Vendor.find({ approved: true }).select('_id');
        const visibleVendorIds = visibleVendors.map(v => v._id);

        const query = {
            vendor: { $in: visibleVendorIds },
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { brand: { $regex: searchTerm, $options: 'i' } },
                { model: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const items = await Item.find(query)
            .populate('vendor', 'companyName')
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);

        return {
            items,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    // Get items by category
    async getItemsByCategory(category, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const visibleVendors = await Vendor.find({ approved: true }).select('_id');
        const visibleVendorIds = visibleVendors.map(v => v._id);

        const query = { 
            category, 
            available: true,
            vendor: { $in: visibleVendorIds }
        };

        const items = await Item.find(query)
            .populate('vendor', 'companyName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);

        return {
            items,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }
}

module.exports = new ItemService();

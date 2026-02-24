const Branch = require('../models/Branch');

// Create a new branch
exports.createBranch = async (req, res) => {
    const { schoolName, branchName, location, status } = req.body;
    try {
        // Check if branch with same name exists
        const existingBranch = await Branch.findOne({ branchName: branchName });
        if (existingBranch) {
            return res.status(400).json({
                success: false,
                message: "Branch already exists"
            });
        }
        
        const branch = await Branch.create({
            schoolName,
            branchName,
            location: location || '',
            status: status || 'active'
        });

        res.status(201).json({
            success: true,
            data: branch,
            message: "Branch created successfully",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error creating branch"
        });
    }
};

// Get all branches
exports.getBranches = async (req, res) => {
    try {
        const branches = await Branch.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch branches"
        });
    }
};


exports.getBranchById = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }

        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch branch'
        });
    }
};

// Update branch
exports.updateBranch = async (req, res) => {
    const { schoolName, branchName, location, status } = req.body;
    try {
        // Find the branch first to check if it exists
        const branchToUpdate = await Branch.findById(req.params.id);
        
        if (!branchToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }

        // Check if another branch with the same name exists (excluding current branch)
        // Only check if branchName is being changed
        if (branchName && branchName !== branchToUpdate.branchName) {
            const existingBranch = await Branch.findOne({ 
                branchName: branchName,
                _id: { $ne: req.params.id }
            });
            
            if (existingBranch) {
                return res.status(400).json({
                    success: false,
                    message: "Branch with this name already exists"
                });
            }
        }

        // Prepare update data
        const updateData = {};
        
        if (schoolName !== undefined) updateData.schoolName = schoolName;
        if (branchName !== undefined) updateData.branchName = branchName;
        if (location !== undefined) updateData.location = location;
        if (status !== undefined) updateData.status = status;

        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Branch updated successfully',
            data: branch
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to update branch"
        });
    }
};

// Delete branch
exports.deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }
        
        await branch.deleteOne();

        res.status(200).json({
            success: true,
            message: "Branch deleted successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to delete branch"
        });
    }
};
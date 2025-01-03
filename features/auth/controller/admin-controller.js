const AdminUserService = require("../service/admin-service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { date } = require("joi");
const ApiErrorCode = require("../../../core/api-error")
const {adminUserValidationSchema,adminUserLoginValidationSchema,updateAdminUserValidationSchema} = require("../utils/admin-validation")


class AdminUserController {

  async login(req, res) {
    try {
      // Validate request body
      const { error } = adminUserLoginValidationSchema.validate(req.body);
      if (error) {
        return res.status(401).json({
          isSuccessfull: false,
          message: "Validation error",
          error: {
            errorCode: ApiErrorCode.validation,
            message: error.message,
          },
        });
      }

      const { username, password } = req.body;
      // Call the login method in the service
      const { token, user } = await AdminUserService.login(username, password);

      res.status(200).json({
        isSuccessfull: true,
        message: "Login successful.",
        data: { token, user },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        isSuccessfull: false,
        message: "Server error",
        error: {
          errorCode: ApiErrorCode.unknownError,
          message: err.message,
        },
      });
    }
  }

  async create(req, res) {

    const { error } = adminUserValidationSchema.validate(req.body);

    if (error) {
        return res.status(401).json({
            isSuccessfull: false,
            message: "Validation error",
            error: {
               errorCode : ApiErrorCode.validation,
               message : error.message
            }
          });
    }

    const { username,email, password, role,dailyRate } = req.body;

    try {
      const adminUser = await AdminUserService.createAdminUser(
        username,
        email,
        password,
        role,
        dailyRate
      );

      res.status(201).json({
        isSuccessfull: true,
        message: "Created user successfully.",
        data : adminUser,
      });

    } catch (error) {
        res.status(500).json({
            isSuccessfull: false,
            message: "Server error",
            error: {
               errorCode : ApiErrorCode.unkwonError,
               message : error.message
            }
          });
    }
  }

  async getAll(req, res) {

    try {

      const query = req.query.query;

      const adminUsers = await AdminUserService.getAllAdminUsers(query);
      res.status(201).json({
        isSuccessfull: true,
        message: "Got all users successfully.",
        data : adminUsers,
      });

    } catch (error) {
        res.status(500).json({
            isSuccessfull: false,
            message: "Server error",
            error: {
               errorCode : ApiErrorCode.unkwonError,
               message : error.message
            }
          });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const adminUser = await AdminUserService.getAdminUserById(id);
      if (!adminUser) {
        res.status(500).json({
            isSuccessfull: false,
            message: "Admin user not found",
            error: {
               errorCode : ApiErrorCode.notFound,
               message : error.message
            }
          });
      }

      res.status(201).json({
        isSuccessfull: true,
        message: "Got all users successfully.",
        data : adminUser,
      });

    } catch (error) {
     res.status(500).json({
            isSuccessfull: false,
            message: "Server error",
            error: {
               errorCode : ApiErrorCode.unkwonError,
               message : error.message
            }
          });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await AdminUserService.deleteAdminUser(id);
      if (!result) {
        res.status(500).json({
            isSuccessfull: false,
            message: "Admin user not found",
            error: {
               errorCode : ApiErrorCode.notFound,
               message : error.message
            }
          });
      }

      res.status(201).json({
        isSuccessfull: true,
        message: "Deleted user successfully.",
        data : null,
      });

    } catch (error) {
        res.status(500).json({
            isSuccessfull: false,
            message: "Server error",
            error: {
               errorCode : ApiErrorCode.unkwonError,
               message : error.message
            }
          });
    }
  }

  async update(req, res) {
        const { id } = req.params; // Extract the user ID from request parameters
        const updates = req.body; // Extract the updated fields from request body

        const { error } = updateAdminUserValidationSchema.validate(updates);

        if (error) {
            return res.status(401).json({
                isSuccessfull: false,
                message: "Validation error",
                error: {
                    errorCode : ApiErrorCode.validation,
                    message : error.message
                }
            });
        }


        try {
            // Call the update method in the service
            const updatedUser = await AdminUserService.updateAdminUser(id, updates);

            if (!updatedUser) {
                return res.status(404).json({
                    isSuccessfull: false,
                    message: "Admin user not found",
                    error: {
                        errorCode: ApiErrorCode.notFound,
                        message: "The user with the specified ID does not exist.",
                    },
                });
            }

            res.status(200).json({
                isSuccessfull: true,
                message: "Updated user successfully.",
                data: updatedUser,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                isSuccessfull: false,
                message: "Server error",
                error: {
                    errorCode: ApiErrorCode.unknownError,
                    message: error.message,
                },
            });
        }
    }

}

module.exports = new AdminUserController();

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stats', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Ensuring it references the users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stats', 'userId');
  }
};

const sql = require('mssql');
const config = require('../config/database');

class FoodModel {
    static async getAll() {
        let pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM MonAn');
        return result.recordset;
    }

 static async create(data) {
        let pool = await sql.connect(config);
        return await pool.request()
            .input('name', sql.NVarChar, data.name)
            .input('portion', sql.Int, parseInt(data.portion)) // Ép kiểu số ở đây cho chắc
            .input('desc', sql.NVarChar, data.desc)
            .query('INSERT INTO MonAn (TenMonAn, KhauPhan, MoTa) VALUES (N\'\' + @name, @portion, N\'\' + @desc)');
    }

    static async update(id, data) {
        let pool = await sql.connect(config);
        return await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, data.name)
            .input('portion', sql.Int, data.portion)
            .query('UPDATE MonAn SET TenMonAn = @name, KhauPhan = @portion WHERE MaMonAn = @id');
    }

    static async delete(id) {
        let pool = await sql.connect(config);
        return await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM MonAn WHERE MaMonAn = @id');
    }
    static async create(data) {
    let pool = await sql.connect(config);
    return await pool.request()
        .input('name', sql.NVarChar, data.name)
        .input('portion', sql.Int, data.portion)
        .input('desc', sql.NVarChar, data.desc)
        .input('calo', sql.Int, data.calo) // Thêm dòng này
        .query('INSERT INTO MonAn (TenMonAn, KhauPhan, MoTa, Calo) VALUES (N\'\' + @name, @portion, N\'\' + @desc, @calo)');
}
}
module.exports = FoodModel;
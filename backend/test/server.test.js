import { use, expect } from 'chai'
import chaiHttp from 'chai-http';
import app from '../server.js';  
import Device from '../models/device.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const chai = use(chaiHttp);

let validToken; 

const testusername = 'thisistestuser1';
const testemail = 'thisistestuser1@gmail.com';
const testpassword = '123456'

describe('Devices API', () => {
    before(async () => {
        // Clean up the database before running tests
        await Device.deleteMany({});
        await User.deleteMany({});
        
        // Create a test user
        const testUser = new User({
          username: testusername,
          email: testemail,
          password: await bcrypt.hash(testpassword, 10), 
        });
        await testUser.save();

        // Create and save a single device
        const device1 = new Device({
            id: 1,
            name: 'Device 1',
            type: 'Type A',
            location: 'Room 1',
            status: 'working',
        });
        await device1.save();
        
        // Login with the test user to get the token
        const res = await chai.request.execute(app)
          .post('/api/login')
          .send({ username: testusername, password: testpassword });
          
        validToken = res.body.accessToken; 
        // console.log('2');

    });
    
    after(async () => {
        // Clean up the database after tests
        await Device.deleteMany({});
        await User.deleteMany({});
    });

    // Test GET devices
    describe('GET /devices', () => {
        it('should return all devices', (done) => {
            chai.request.execute(app)
                .get('/devices')
                .set('Authorization', `Bearer ${validToken}`) 
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });

    // Test POST devices
    describe('POST /devices', () => {
        it('should create a new device', (done) => {
        chai.request.execute(app)
            .post('/devices')
            .set('Authorization', `Bearer ${validToken}`) 
            .send({ id: 7, name: 'New Device', type: 'Sensor', location: 'Room 7', status: 'working' })
            .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('name', 'New Device');
            done();
            });
        });
    });

    // Test PATCH devices
    describe('PATCH /devices/:id', () => {
        it('should update an existing device', (done) => {
            chai.request.execute(app)
                .patch(`/devices/1`)
                .set('Authorization', `Bearer ${validToken}`) 
                .send({ name: 'Updated Device Name' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('name', 'Updated Device Name');
                    done();
                });
        });

        it('should return 404 for a non-existent device', (done) => {
            chai.request.execute(app)
                .patch('/devices/999')
                .set('Authorization', `Bearer ${validToken}`) 
                .send({ name: 'Non-existent Device' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'Device not found');
                    done();
                });
        });
    });

    // Test DELETE device
    describe('DELETE /devices/:id', () => {
        it('should delete an existing device', (done) => {
            chai.request.execute(app)
                .delete(`/devices/1`)
                .set('Authorization', `Bearer ${validToken}`) 
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message', 'Device deleted successfully');
                    done();
                });
        });

        it('should return 404 for a non-existent device', (done) => {
            chai.request.execute(app)
                .delete('/devices/999')
                .set('Authorization', `Bearer ${validToken}`) 
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'Device not found');
                    done();
                });
        });
    });
});
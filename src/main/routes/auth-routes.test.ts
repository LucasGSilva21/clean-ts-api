import request from 'supertest'
import { Express } from 'express'
import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db/mongodb/helpers/mongo-helper'
import { Collection } from 'mongodb'
import { hash } from 'bcrypt'

let accountCollection: Collection
let app: Express

describe('Auth Routes', () => {
  beforeAll(async () => {
    app = await setupApp()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('POST /signup', () => {
    test('Should return 200 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'valid_name',
          email: 'valid_email@mail.com',
          password: '123456',
          passwordConfirmation: '123456'
        })
        .expect(200)
    })
  })

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const password = await hash('123456', 12)
      await accountCollection.insertOne({
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password
      })
      await request(app)
        .post('/api/login')
        .send({
          email: 'valid_email@mail.com',
          password: '123456'
        })
        .expect(200)
    })

    test('Should return 401 on login', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'valid_email@mail.com',
          password: '123456'
        })
        .expect(401)
    })
  })
})

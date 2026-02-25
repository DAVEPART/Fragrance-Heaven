import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { useAlert } from '../context/AlertContext'
import Button from './ui/Button'
import Input from './ui/Input'

const Login = ({ setToken }) => {
    const alert = useAlert();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
            if (response.data.success) {
                setToken(response.data.token)
            } else {
                alert.error(response.data.message)
            }

        } catch (error) {
            console.log(error);
            alert.error(error.message)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-primary-50 to-primary-100'>
            <div className='bg-white shadow-card rounded-xl px-10 py-8 max-w-md w-full'>
                <h1 className='text-3xl font-bold mb-2 text-gray-900'>Admin Panel</h1>
                <p className='text-gray-600 mb-6'>Sign in to manage your store</p>
                <form onSubmit={onSubmitHandler}>
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="mb-4"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="mb-6"
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        Login
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default Login

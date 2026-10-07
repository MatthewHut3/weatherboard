import React, { useState, useEffect, type JSX } from 'react'
import './Search.css'

const apiUrl = import.meta.env.VITE_API_URL as string | undefined

if (!apiUrl) {
    console.warn('VITE_API_URL is not defined; auth requests will fail until you add it to the frontend .env file.')
}

interface MessageResponse {
    message?: string
}

interface AuthSuccessResponse {
    token: string
}

interface CityInfo {
    id: number
    name: string
    temperature: string
    condition: string
}

function getStoredToken(): string | null {
    return window.localStorage.getItem('userToken')
}

let favorites: number[] = [
    1
]

const cities: CityInfo[] = [
    { id: 1, name: 'New York', temperature: '25°C', condition: "Sunny" },
    { id: 2, name: 'Los Angeles', temperature: '30°C', condition: "Cloudy" },
    { id: 3, name: 'London', temperature: '20°C', condition: "Rainy" },
]

function Search() {
    const [inputValue, setInputValue] = useState('')
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState<CityInfo[]>([])
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState<string | null>(() => getStoredToken())

    useEffect(() => {
        if (token) {
            window.localStorage.setItem('userToken', token)
            return
        }

        window.localStorage.removeItem('userToken')
    }, [token])

    useEffect(() => {
        if (query.trim() === '') {
            setSearchResults([])
            return
        }

        setLoading(true)
        newSearch(query).then(results => {
            setSearchResults(results)
            setLoading(false)
        }).catch(error => {
            console.error('Search failed:', error)
            setSearchResults([])
            setLoading(false)
        })
    }, [query])

    const firstResult = searchResults.length > 0 ? searchResults[0] : null

    return (
        <React.Fragment>

            <div className="search">
                <input
                    type="text"
                    placeholder="Search..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setQuery(e.currentTarget.value)
                            console.log(`Searching for: ${e.currentTarget.value}`)
                        }
                    }}
                />

            </div>
            <div className="results-columns">
                <FavoritesComponent token={token} onTokenChange={setToken}/>

                <div className="results">
                    <h2>Search Results</h2>
                    {loading && <p>Loading...</p>}
                    {!loading && firstResult && makeCityCard(firstResult)}
                    {!loading && !firstResult && query && <p>No results found</p>}
                </div>
                <LoginComponent token={token} onTokenChange={setToken} />
            </div>
        </React.Fragment>
    )
}

interface LoginComponentProps {
    token: string | null
    onTokenChange: (nextToken: string | null) => void
}

interface FavoritesComponentProps {
    token: string | null
    onTokenChange: (nextToken: string | null) => void
}

interface StatusMessage {
    message: string
    type: 'error' | 'success'
}

function FavoritesComponent({ token, onTokenChange }: FavoritesComponentProps): JSX.Element {
    

    if (!token) {
        //dont return anything as not logged in

        return (<p>Login to view favorites</p>)
    } else {
        // display favs if token avaliable

        return (
            <data className="favorites">
                <h2>Favorites</h2>
                {favorites.length === 0 ? (
                    <p>No favorites found</p>
                ) : (
                    favorites.map((id) => {
                        const city = cities.find((city) => city.id === id)
                        return city ? (
                            <div key={city.id} className="favorite">
                                <h3>{city.name}</h3>
                                <p>{city.temperature}</p>
                                <p>Condition: {city.condition}</p>
                            </div>) : null
                    })
                )}
            </data>
        )
    }
}


function LoginComponent({ token, onTokenChange }: LoginComponentProps): JSX.Element {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (isSubmitting) {
            return
        }

        setIsSubmitting(true)
        setStatusMessage(null)

        try {
            if (isRegistering) {
                await createAccount(username, password)
                setIsRegistering(false)
                setPassword('')
                setStatusMessage({ message: 'Account created successfully.', type: 'success' })
                return
            }

            const newToken = await attemptLogin(username, password)
            setPassword('')
            onTokenChange(newToken)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error occurred during login or registration.'
            setStatusMessage({ message, type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (token) {
        return (
            <div className="login-form">
                <h2>Logged in</h2>
                <a href="#" onClick={(e) => {
                    e.preventDefault()
                    onTokenChange(null)
                }}>
                    Logout
                </a>
            </div>
        )
    }

    return (
        // Login / Register Form
        <div className="login-form">
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
                </button>
            </form>
            {statusMessage && (
                <p
                    role={statusMessage.type === 'error' ? 'alert' : 'status'}
                    className={statusMessage.type === 'success' ? 'success' : 'error'}
                >
                    {statusMessage.message}
                </p>
            )}
            <a href="#" onClick={(e) => {
                e.preventDefault()
                setIsRegistering((current) => !current)
                setStatusMessage(null) // Clear any previous status messages when switching modes
            }}>
                {isRegistering ? 'Back to login' : 'Create an account'}
            </a>
        </div>
    )
}



function makeCityCard(city: CityInfo): JSX.Element {
    return (
        <table className="city-card">
            <tr>
                <th>Name</th>
                <th>Temperature</th>
                <th>Condition</th>
            </tr>

            <tr>
                <td>{city.name}</td>
                <td>{city.temperature}</td>
                <td>{city.condition}</td>
            </tr>

        </table>
    )
}

interface InitCityInfo {
    name: string
    lat: string
    lon: string
}

async function createAccount(username: string, password: string): Promise<void> {
    let response: Response
    try {
        response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
    } catch {
        throw new Error('Unable to reach the server while creating the account.')
    }

    if (!response.ok) {
        const data: MessageResponse = await response.json().catch(() => ({}))
        throw new Error(data.message ?? `${response.status} ${response.statusText}`)
    }
}

async function attemptLogin(username: string, password: string): Promise<string> {
    let response: Response
    try {
        response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
    } catch {
        throw new Error('Unable to reach the server while logging in.')
    }

    if (!response.ok) {
        const data: MessageResponse = await response.json().catch(() => ({}))
        throw new Error(data.message ?? `${response.status} ${response.statusText}`)
    }

    const data: AuthSuccessResponse = await response.json()

    if (typeof data.token !== 'string' || data.token.trim() === '') {
        throw new Error('Login response did not include a valid token.')
    }

    return data.token
}

function getResultsAPI(query: string): Promise<InitCityInfo[]> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}`

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }
            return response.json() as Promise<{ results?: Array<{ name: string, latitude: number, longitude: number }> }>
        })
        .then((data) => {
            console.log(`Parsed data for ${query}:`, data)
            const firstResult = data.results?.[0]
            return firstResult ? [{
                name: firstResult.name,
                lat: firstResult.latitude.toString(),
                lon: firstResult.longitude.toString()
            }] : []
        })
        .catch((error) => {
            console.error('Error fetching city data:', error)
            return []
        })
}

function getWeatherAPI(lat: string, lon: string): Promise<{ temperature: number, weathercode: number }> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true`

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }
            return response.json() as Promise<{ current_weather: { temperature: number, weathercode: number } }>
        })
        .then((data) => data.current_weather)
        .catch((error) => {
            console.error('Error fetching weather data:', error)
            return { temperature: 0, weathercode: 0 }
        })
}

async function newSearch(query: string): Promise<CityInfo[]> {
    const cities = await getResultsAPI(query)
    const weatherPromises = cities.map((city) => getWeatherAPI(city.lat, city.lon).then((weather) => ({
        id: Math.floor(Math.random() * 1000000), // Generate a random ID for the city
        name: city.name,
        temperature: `${weather.temperature}°C`,
        condition: weatherCodetoCondition(weather.weathercode)
    }))
    )
    return await Promise.all(weatherPromises)
}

function weatherCodetoCondition(code: number): string {
    // 0	Clear sky
    // 1	Mainly clear
    // 2	Partly cloudy
    // 3	Overcast
    // 45	Fog
    // 48	Depositing rime fog
    // 51	Light drizzle
    // 53	Moderate drizzle
    // 55	Dense drizzle
    // 56	Light freezing drizzle
    // 57	Dense freezing drizzle
    // 61	Slight rain
    // 63	Moderate rain
    // 65	Heavy rain
    // 66	Light freezing rain
    // 67	Heavy freezing rain
    // 71	Slight snowfall
    // 73	Moderate snowfall
    // 75	Heavy snowfall
    // 77	Snow grains
    // 80	Slight rain showers
    // 81	Moderate rain showers
    // 82	Violent rain showers
    // 85	Slight snow showers
    // 86	Heavy snow showers
    // 95	Thunderstorm
    // 96	Thunderstorm with slight hail *
    // 97	Heavy thunderstorm
    // 99	Thunderstorm with heavy hail *

    switch (code) {
        case 0:
            return "Clear sky"
        case 1:
            return "Mainly clear"
        case 2:
            return "Partly cloudy"
        case 3:
            return "Overcast"
        case 45:
            return "Fog"
        case 48:
            return "Depositing rime fog"
        case 51:
            return "Light drizzle"
        case 53:
            return "Moderate drizzle"
        case 55:
            return "Dense drizzle"
        case 56:
            return "Light freezing drizzle"
        case 57:
            return "Dense freezing drizzle"
        case 61:
            return "Slight rain"
        case 63:
            return "Moderate rain"
        case 65:
            return "Heavy rain"
        case 66:
            return "Light freezing rain"
        case 67:
            return "Heavy freezing rain"
        case 71:
            return "Slight snowfall"
        case 73:
            return "Moderate snowfall"
        case 75:
            return "Heavy snowfall"
        case 77:
            return "Snow grains"
        case 80:
            return "Slight rain showers"
        case 81:
            return "Moderate rain showers"
        case 82:
            return "Violent rain showers"
        case 85:
            return "Slight snow showers"
        case 86:
            return "Heavy snow showers"
        case 95:
            return "Thunderstorm"
        case 96:
            return "Thunderstorm with slight hail"
        case 97:
            return "Heavy thunderstorm"
        case 99:
            return "Thunderstorm with heavy hail"
        default:
            return "Unknown condition"
    }
}

export default Search
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineSearch } from "react-icons/ai";
import Loader from './Loading';

const CityTable = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();

  // Function to fetch cities from API
  const fetchCities = async (loadMore = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&rows=${limit}&start=${loadMore ? cities.length : 0}`
      );
      const data = await response.json();

      if (loadMore) {
        setCities((prevCities) => [...prevCities, ...data.records]);
      } else {
        setCities(data.records);
      }
      setFilteredCities((prevCities) => [...prevCities, ...data.records]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    // eslint-disable-next-line
  }, [limit]);

  // Handle search input and filter cities based on the input
  const handleSearchChange = async (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {

      setFilteredCities(cities);
    } else {
      try {
        const response = await fetch(
          `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&rows=1000&&q=${term}`
        );
        const data = await response.json();
        setFilteredCities(data.records);
      } catch (err) {
        console.error("Error fetching filtered cities:", err);
      }
    }
  };



  // Infinite scroll implementation using IntersectionObserver
  const loadMoreCities = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !searchTerm) {
      setLimit((prevLimit) => prevLimit + 50);
    }
  };

  useEffect(() => {
    const observerElement = observer.current;

    const observerInstance = new IntersectionObserver(loadMoreCities, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (observerElement) observerInstance.observe(observerElement);

    return () => {
      if (observerElement) observerInstance.unobserve(observerElement);
    };
    // eslint-disable-next-line
  }, [cities, searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        City Directory
      </h1>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-3 pl-10 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm"
        />
        <AiOutlineSearch className="absolute left-4 top-3 text-gray-500" size={24} />
      </div>

      {loading && !cities.length ? (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 mb-4"></div>
          <p>Loading cities...</p>
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">Error fetching cities: {error.message}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-lg rounded-lg mt-4">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="py-3 px-5 text-left">City Name</th>
                  <th className="py-3 px-5 text-left">Country</th>
                  <th className="py-3 px-5 text-left">Timezone</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } hover:bg-blue-100 transition-all duration-200 ease-in-out`}
                  >
                    <td className="py-3 px-5 border-b">
                      <Link
                        to={`/weather/${city.fields.name}/${city.fields.coordinates[0]}/${city.fields.coordinates[1]}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {city.fields.name}
                      </Link>
                    </td>
                    <td className="py-3 px-5 border-b">{city.fields.cou_name_en}</td>
                    <td className="py-3 px-5 border-b">{city.fields.timezone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!searchTerm && (<Loader />
          )}
          {loading && <Loader />}
        </>
      )}
    </div>

  );
};

export default CityTable;

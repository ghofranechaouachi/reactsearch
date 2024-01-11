import React, { useState, useReducer, useEffect, useCallback } from 'react'
import { orderBy } from "lodash";
import axios from "axios";
import './App.css'



const eventsReducer = (state, action) => {
  switch (action.type) {
    case "EVENTS_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "EVENTS_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "EVENTS_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_EVENT":
      return {
        ...state,
        data: state.data.filter(
          (event) => action.payload.name !== event.name,
        ),
      };
    default:
      throw new Error();
  }
};

const API_ENDPOINT = "https://app.ticketmaster.com/discovery/v2/events?apikey=IORkGJ7JQdPEnA8K2wx6kQOS5KgA5kGv&keyword=";

function App() {
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['#03254c', '#1167b1', '#187bcd', '#2a9df4'];

  const [searchTerm, setSearchTerm] = useState<string>("");//"all"
  const [tri1, setTri1]= useState<string>(""); 
  const [inverse, setInverse]= useState<string>("asc");
  const [count, setCount]= useState<number>(1);
  const [pagecount, setPageCount]= useState<number>(0);
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}&page=${pagecount}`);
  interface UrlItem {
    search: string;
    url: string;
  }
  const [urls, setUrls] = useState<UrlItem[]>([]);

  const [events, dispatchEvents] = useReducer(eventsReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const handleFetchEvents = useCallback(async () => {
    dispatchEvents({ type: "EVENTS_FETCH_INIT" });

    try {
      const result = await axios.get(url, {
        headers: {
         
          "Content-Type": "application/json",
        },
      });
      console.log(result.data._embedded.events);

      dispatchEvents({
        type: "EVENTS_FETCH_SUCCESS",
        payload: result.data._embedded.events, //result.data
      });
    } catch {
      dispatchEvents({ type: "EVENTS_FETCH_FAILURE" });
    }
  }, [url]);

  useEffect(() => {
    handleFetchEvents();
  }, [handleFetchEvents]);


  const handleRemoveEvent = (item) => {
    dispatchEvents({
      type: "REMOVE_EVENT",
      payload: item,
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };
  const handlePageForward = () => {
    setPageCount(prevPageCount => prevPageCount + 1);
    setUrl(`${API_ENDPOINT}${searchTerm}&page=${pagecount+1}`);
  };
  const handlePageBackward = () => {
    if(pagecount > 0)
      setPageCount(prevPageCount => prevPageCount - 1);
    setUrl(`${API_ENDPOINT}${searchTerm}&page=${pagecount==0 ? pagecount : pagecount-1}`);
  };
  const handleSearchHistory = (url) => {
    setUrl(`${url.url}${url.search}`);
  
   
  };
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    if (!urls.some(url => url.search === searchTerm)) {
      setUrls((current: Array<{ search: string; url: string }>) => [
        ...current,
        {
          search: searchTerm,
          url: API_ENDPOINT,
        },
      ]);
    }

    event.preventDefault();
    console.log(events.data)
  };
  const hadnleTri1 = (value: string) => {
    // tri list
    setTri1(value)
    setCount(count+1)
    if (count % 2 == 0) 
      setInverse("asc")
    else
      setInverse("desc")
    
  
    
  }

  const sortList  = orderBy(events.data, tri1, inverse)
  
      
  return (
    <div style={{ backgroundColor: colors[colorIndex] }} className="container"> 
    
      <h1 className="headlinePrimary">Available Events</h1>
      
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      <div className='history'>
        <span> History :</span>
     {urls && urls.map(url => (
       
        <button onClick={()=>handleSearchHistory(url)}>{url.search}</button>
     
      ))}
    </div>
    <div className="sorting-arrows">
    <span className="sort-arrow" onClick={() => hadnleTri1("name")}>
          Date ▲▼
        </span>
        <span className="sort-arrow" onClick={() => hadnleTri1("dates.start.localDate")}>
          Name ▲▼
        </span>
    </div>
    <div className='page'>
    
      <button className="button button_small" onClick={handlePageBackward}>
      ←
      </button>
      <button className="button button_small" onClick={handlePageForward}>
      →
      </button>
    </div>
      <div>  </div>

      {events.isError && <p>Something went wrong ...</p>}

      {events.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <>
        <List list={tri1 ? sortList:events.data}  onRemoveItem={handleRemoveEvent} />
        </>
      )}
    </div>
  );
  
}

type SearchProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }:SearchProps) => (
  <form className="search_form" onSubmit={onSearchSubmit}>
    <label htmlFor="search">Search: </label>
     
      <input
        id="search"
        type="text"
        value={searchTerm}
        onChange={onSearchInput}
        className="search-input"
        placeholder='Search here'
      />
      
    <button className="button button_large" type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
);

type Events = EventType[];
type ListProps = {
  list: Events;
  onRemoveItem: (item: EventType) => void;
};
const List = ({ list, onRemoveItem }: ListProps) => (
  <ul className='list'>
    {list.map((item) => (
      <Item item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
);

type EventType = {
  name: string;
  url: string;
  dates: {
    start: {
      localDate: string;
    };
    timezone: string;
  };
  locale: string;
  images?: {
    url: string;
  }[];
};



type ItemProps = {
  item: EventType;
  onRemoveItem: (item: EventType) => void;
};
const Item = ({ item, onRemoveItem }: ItemProps) => (
  <li className="item">
  <span style={{ width: "10%" }}>
      {item.images && item.images.length > 0 && (
        <img src={item.images[0].url} alt={item.name} style={{ width: "50px", height: "50px" }} />
      )}
    </span>
    <span style={{width:"40%"}}>
      <a href={item.url}>{item.name}</a>
    </span>
    <span style={{width:"30%"}}>{item.dates.start.localDate}</span>

    <span style={{width:"30%"}}>{item.dates.timezone}</span>
    <span style={{width:"10%"}}>{item.locale}</span>
  
    <span style={{width:"10%"}}>
      <button className="button button_small" type="button" onClick={() => onRemoveItem(item)}>
        Remove
      </button>
    </span>
  </li>
);

export default App;
export { eventsReducer,
  SearchForm,
  List, Item };

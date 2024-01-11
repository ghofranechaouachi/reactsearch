import App, {
    eventsReducer,
    Item,
    List,
    SearchForm,
    } from "./App";
import { describe, it, expect, vi } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    } from '@testing-library/react';

import axios from 'axios';
vi.mock('axios');

// Test Data
const eventOne = {
    name: 'D-A-D',
    url: 'https://www.ticketmaster.com/not-another-dd-podcast-medford-massachuset',
    dates: {
        start:{
            localDate: "2024-11-01",
        },
        timezone: 'Europe/Copenhagen'
    },
    locale: "en-us",
  
};
const eventTwo = {
    name: 'Not Another D+D Podcast',
    url: 'https://www.ticketmaster.dk/event/d-a-d-tickets/540577?language=en-us',
    dates: {
        start:{
            localDate: "2024-01-19",
        },
        timezone: 'America/New_York'
    },
    locale: "en-us",
};
      
//Un test unitaire de la fonction reducer. Le test doit prendre en compte tous les cas possibles du reducer.

    const events = [eventOne, eventTwo];
    describe('eventsReducer', () => {
    it('removes an event', () => {
    const action = { 
        type:'REMOVE_EVENT',
         payload: eventOne}; // TODO: some action
    const state = {
        data: events, 
        isLoading: false, 
        isError: false };  // TODO: some current state
    const newState = eventsReducer(state, action);
    const expectedState ={
        data: [eventTwo],
        isLoading: false,
        isError: false,
    };  // TODO: the expected state
    expect(newState).toEqual(expectedState);
    }); 
});


describe('eventsReducer', () => {
it('Get events', () => {
const action = { type:'EVENTS_FETCH_SUCCESS', payload: events}; // TODO: some action
const state = {data: [], isLoading: true, isError: false };  // TODO: some current state
const newState = eventsReducer(state, action);
const expectedState =  {
    data: events,
    isLoading: false,
    isError: false,
};  // TODO: the expected state
expect(newState).toStrictEqual(expectedState);
}); 
});


describe('eventsReducer', () => {
it('No events', () => {
const action = { type:'EVENTS_FETCH_FAILURE'}; // TODO: some action
const state = {data: [], isLoading: false, isError: false };  // TODO: some current state
const newState = eventsReducer(state, action);
const expectedState =  {
    data: [],
    isLoading: false,
    isError: true,
};  // TODO: the expected state
expect(newState).toStrictEqual(expectedState);
}); 
});


describe('eventsReducer', () => {
it('init fetch', () => {
const action = { type:'EVENTS_FETCH_INIT'}; // TODO: some action
const state = {data: [], isLoading: false, isError: false };  // TODO: some current state
const newState = eventsReducer(state, action);
const expectedState =  {
    data: [],
    isLoading: true,
    isError: false,
};  // TODO: the expected state
expect(newState).toStrictEqual(expectedState);
}); 
});

//Un test unitaire pour chaque composant de l'application.
//Item component
const mockOnRemoveItem = vi.fn();
describe('Item', () => {
    it('renders all properties', () => {
        render(<Item item={eventOne} onRemoveItem={mockOnRemoveItem}/>);
        screen.debug();
        expect(screen.getByText("2024-11-01")).toBeInTheDocument();
        expect(screen.getByText("Europe/Copenhagen")).toBeInTheDocument();
        expect(screen.getByText("en-us")).toBeInTheDocument();
    
        const removeButton = screen.getByText(/Remove/i).closest('button');
    fireEvent.click(removeButton);

    expect(mockOnRemoveItem).toHaveBeenCalledWith(eventOne);
    });
});


describe('SearchForm', () => {
    it('renders all properties', () => {
        render(<SearchForm />);
        screen.debug();
    });
});

// testing removing event
describe('App', () => {
    it('removes a event', async () => {
    const promise = Promise.resolve({
        data: {
            _embedded: events,
        },
    });
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    await waitFor(async () => await promise);
    expect(screen.getAllByText('Remove').length).toBe(2);
    expect(screen.getByText('D-A-D')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(screen.getAllByText('Remove').length).toBe(1);
    expect(screen.queryByText('D-A-D')).toBeNull();
    });
});
    //gration pour le happy path.
describe('App', () => {
    it('succeeds fetching data', async () => {
    axios.get.mockResolvedValueOnce({ data: { _embedded: [eventOne, eventTwo] } });
    render(<App />);
    expect(screen.queryByText(/Loading/)).toBeInTheDocument(); // we expect loading here
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Loading/)).toBeNull(); // then we expect the data, and not loading again
  });
})

//Un test d'intégration  pour le unhappy path.
//this test to test use case or sceanrio if the app is
// handling the error properly(calling wrong url endppoint for example)
describe('App' , () => {
it('fails fetching data', async () => {
    const promise = Promise.reject();
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
     // use getByText to look for something that exists
    try {
        await waitFor(async () => await promise);
    } catch (error) {
        expect(screen.queryByText(/Loading/)).toBeNull();
    //use getByQuery to look for something that might or might not exists
        expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
    }
});
});


// //Testing searching feature
describe('App' , () => {
    it('searches for event', async () => {
        const DPromise = Promise.resolve({
            data: {
                _embedded: [eventOne],
            },
        })
   
    const NPromise = Promise.resolve({
        data: {
            hits: [eventTwo],
        },
    })
    axios.get.mockImplementation((url) =>{
        if (url.includes('D')){
            return DPromise;
        }
        if (url.includes('N')){
            return NPromise;
        }
        throw Error();
    })
    });

});





    
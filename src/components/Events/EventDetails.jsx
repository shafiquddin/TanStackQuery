import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';


export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false)
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })

  const { mutate, isError: isErrorDeltion, error: errorDeletion, isPending: isPendingDeletion } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' }),
        navigate('/events')
    }
  })

  let content;

  if (isPending) {
    content = <div id="event-details-content" className='center'>
      <p>Fetching event data...</p>
    </div>
  }

  if (isError) {
    content = <div id="event-details-content" className='center'>
      <ErrorBlock title="" message={error.info?.message || 'could not fetch the event'} />
    </div>
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    const startDeleting = () => {
      setIsDeleting(true)
    }

    content = <article id="event-details">
      <header>
        <h1>{data.title}</h1>
        <nav>
          <button onClick={startDeleting}>Delete</button>
          <Link to="edit">Edit</Link>
        </nav>
      </header>
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt={data.image} />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
          </div>
          <p id="event-details-description">{data.description}</p>
        </div>
      </div>
    </article>
  }
  const deleteHandle = () => {
    mutate({ id: params.id })
  }

  const stopDeleting = () => {
    setIsDeleting(false)
  }

  return (
    <>
      {isDeleting && <Modal onClose={stopDeleting}>
        <h2>Are you sure?</h2>
        <p>Are you really want delete the events.</p>
        <div className='form-actions'>
          {isPendingDeletion ? <p>Deleting, Please wait</p> : <>
            <button onClick={stopDeleting} className='button-text'>Close</button>
            <button onClick={deleteHandle} className='button'>Delete</button>
          </>}
        </div>
        {isErrorDeltion && <ErrorBlock title="Failed to delete event" message={errorDeletion.info?.message || 'failed to delete event'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  );
}

import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();
  const { data, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime:10000
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (updatedEvent) => {
  //     await queryClient.cancelQueries(['events', params.id]);
  //     const previousEvent = queryClient.getQueryData(['events', params.id]);
  //     queryClient.setQueryData(['events', params.id], updatedEvent.event);
  //     return { previousEvent };
  //   },
  //   onError: (err, newEvent, context) => {
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id]);
  //   },
  //   onSuccess: () => {
  //     navigate('../');
  //   }
  // });

  function handleSubmit(formData) {
    // mutate({ event: formData, id: params.id });
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock title="Failed to fetch event" message={error.message || 'Failed to fetch event, try again later'} />
        <div className='form-actions'>
          <Link to='../' className='button'>Okay</Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (<p>Submiting please wait</p>) : (<>
          <Link to="../" className="button-text">Cancel</Link>
          <button type="submit" className="button">Update</button>
        </>)}
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>{content}</Modal>
  );
}

export const loader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })
}

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const eventData = Object.fromEntries(formData.entries());
  await updateEvent({ event: eventData, id: params.id });
  await queryClient.invalidateQueries(['events'])
  return redirect("../");
}
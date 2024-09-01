'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";

import { supaClient } from "../../supa-client";

import { RootState } from "../../lib/interfaces/interface";
import { fetchInviteEvents } from "../../redux/actions/actions";

function Invite() {
  const dispatch = useDispatch();
  
  const selectInviteEvents = (state: RootState) => state.inviteEventsReducer;
  const { inviteEvents } = useSelector(selectInviteEvents);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data: eventsData, error } = await supaClient
          .from('events')
          .select('*');
  
        if (error) throw error;
  
        if (eventsData && eventsData.length > 0) {
          dispatch(fetchInviteEvents(eventsData));
          toast.success(`Retrieved Events`);
        } else {
          toast.success(`No events data returned from Supabase`);
        }
      } catch (error) {
        toast.error(`Error fetching events: ${error}`)
      }
    };

    fetchEventDetails();
  }, [dispatch]);

  return (
      <>
      <div className="flex justify-start w-full lg:px-12 px-10 pb-3 font-poppins dark:text-blog-white lg:text-2xl text-lg">
          <FormattedMessage
              id="invite-page-heading"
              description="Event Details" // Description should be a string literal
              defaultMessage="Event Details" // Message should be a string literal
          />
      </div>
      {/* Event Section */}
      {
        <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
          <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                  {/* Event Row */}
                  {inviteEvents && inviteEvents.map((inviteEvent, index, array) => (
                      <div key={inviteEvent.id} className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                          <div className="flex flex-row gap-2 h-full w-full">
                              <div className="flex">
                                  
                              </div>
                              <div className="flex flex-col w-full justify-between">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className="lg:text-xl text-xs">{inviteEvent.title}</div>
                                          <div className="lg:text-xl text-xs">{inviteEvent.description}</div>
                                          <div className="lg:text-xl text-xs">{inviteEvent.location}</div>
                                      </div>
                                      <FontAwesomeIcon icon={faCircleXmark} className="cursor-pointer" size="xl" />
                                  </div>
                                  <div className="flex flex-row justify-between items-center">
                                      <div>
                                          
                                      </div>
                                      <div className="lg:text-2xl text-xs">
                                          
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      }
      </>
  );

}

export default Invite;

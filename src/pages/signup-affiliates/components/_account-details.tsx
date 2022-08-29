import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import validation from '../validations/account-details'
import { DropdownSearch } from 'components/elements'
import { Input } from 'components/form'
import { localize } from 'components/localization'
import device from 'themes/device'
import { useDerivWS } from 'store'

const InputGroup = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-top: 2.5rem;
    margin-bottom: 1.5rem;
    justify-content: center;
`
const InputWrapper = styled.div`
    width: 50%;
    line-height: 10px;
    font-weight: normal;
    margin-right: 1rem;
    @media ${device.mobileL} {
        width: unset;
        max-width: 191px;
    }
`
const DropdownSearchWrapper = styled.div`
    margin-bottom: -16px;
`
const getCountryList = () => {
    return {
        residence_list: 1,
    }
}
const country_list = getCountryList()

type countryType = {
    name: string
    display_name: string
    value: string
}

type AccountDetailsProps = {
    updatedData: (e) => void
    onValidate: (e) => void
    affiliate_address_data: {
        state: string
        city: string
        street: string
        postal_code: string
        country: {
            name: string
        }
    }
}

const AccountDetails = ({
    updatedData,
    affiliate_address_data,
    onValidate,
}: AccountDetailsProps) => {
    const [residence_list, setResidenceList] = useState([])
    const [country, setCountry] = useState(affiliate_address_data.country)
    const [state, setState] = useState(affiliate_address_data.state)
    const [city, setCity] = useState(affiliate_address_data.city)
    const [street, setStreet] = useState(affiliate_address_data.street)
    const [postal_code, setPostCode] = useState(affiliate_address_data.postal_code)
    const [country_error_msg, setCountryErrorMsg] = React.useState('')
    const [state_error_msg, setStateErrorMsg] = React.useState('')
    const [city_error_msg, setCityErrorMsg] = React.useState('')
    const [street_error_msg, setStreetErrorMsg] = React.useState('')
    const [postcode_error_msg, setPostCodeErrorMsg] = React.useState('')

    const { send } = useDerivWS()

    useEffect(() => {
        updatedData({
            country,
            state,
            street,
            city,
            postal_code,
        })
    }, [country, state, street, city, postal_code])

    useEffect(() => {
        send(country_list, (response) => {
            if (!response.error) {
                const residence_list_response = response.residence_list.map(({ text, value }) => {
                    const country: countryType = {
                        name: text,
                        display_name: text,
                        value: value,
                    }
                    return country
                })
                setResidenceList(residence_list_response)
            }
        })
    }, [send])

    const validate = !(
        country_error_msg ||
        !country ||
        !state ||
        !city ||
        !street ||
        !postal_code ||
        state_error_msg ||
        city_error_msg ||
        street_error_msg ||
        postcode_error_msg
    )

    useEffect(() => {
        onValidate(validate ? true : false)
    }, [onValidate, validate])

    const form_inputs = [
        {
            id: 'dm-country-select',
            name: 'country',
            type: 'select',
            label: localize('Country of residence'),
            placeholder: 'Country of residence',
            required: true,
            error: country_error_msg,
            value: country,
            list: residence_list,
        },
        {
            id: 'dm-state',
            name: 'state',
            type: 'text',
            error: state_error_msg,
            label: localize('State/province'),
            placeholder: 'State/province',
            required: true,
            value: state,
        },
        {
            id: 'dm-town',
            name: 'city',
            type: 'text',
            label: localize('Town/city'),
            placeholder: 'Town/city',
            required: true,
            error: city_error_msg,
            value: city,
        },
        {
            id: 'dm-street',
            name: 'street',
            type: 'text',
            label: localize('Street'),
            placeholder: 'Street',
            required: true,
            error: street_error_msg,
            value: street,
        },
        {
            id: 'dm-postal-code',
            name: 'postal_code',
            type: 'text',
            label: localize('Postal/Zip code'),
            placeholder: 'Postal/Zip code',
            required: true,
            error: postcode_error_msg,
            value: postal_code,
        },
    ]
    const handleInput = (e) => {
        const { name, value } = e.target
        switch (name) {
            case 'country': {
                setCountry(value)
                return setCountryErrorMsg(validateCountry(value))
            }
            case 'state': {
                setState(value)
                return setStateErrorMsg(validateState(value))
            }
            case 'city': {
                setCity(value)
                return setCityErrorMsg(validateCity(value))
            }
            case 'street': {
                setStreet(value)
                return setStreetErrorMsg(validateStreet(value))
            }
            case 'postal_code': {
                setPostCode(value)
                return setPostCodeErrorMsg(validatePostCode(value))
            }
        }
    }

    const validateCountry = (country_str) => {
        const error_message = validation.country(country_str)
        return error_message
    }
    const validateState = (state_str) => {
        const error_message = validation.address_state(state_str)
        return error_message
    }
    const validateCity = (state_str) => {
        const error_message = validation.address_city(state_str)
        return error_message
    }
    const validateStreet = (state_str) => {
        const error_message = validation.address_street(state_str)
        return error_message
    }
    const validatePostCode = (state_str) => {
        const error_message = validation.address_postal_code(state_str)
        return error_message
    }

    return (
        <InputGroup>
            <InputWrapper>
                {form_inputs.map((item, index) => {
                    if (item.name === 'country') {
                        return (
                            <DropdownSearchWrapper key={item.id}>
                                <DropdownSearch
                                    id={item.id}
                                    label_position={0.8}
                                    key={index}
                                    selected_item={country}
                                    onChange={(country) => setCountry(country)}
                                    error={item.error}
                                    items={item.list}
                                    label={localize('Country of residence')}
                                />
                            </DropdownSearchWrapper>
                        )
                    } else {
                        return (
                            <Input
                                width={500}
                                id={item.id}
                                name={item.name}
                                key={index}
                                type={item.type}
                                value={item.value}
                                error={item.error}
                                border="solid 1px var(--color-grey-7)"
                                label_color="grey-5"
                                label_hover_color="grey-5"
                                background="white"
                                label={localize(item.label)}
                                placeholder={item.placeholder}
                                onChange={handleInput}
                                onBlur={handleInput}
                                autoComplete="off"
                                required={item.required}
                            />
                        )
                    }
                })}
            </InputWrapper>
        </InputGroup>
    )
}

export default AccountDetails

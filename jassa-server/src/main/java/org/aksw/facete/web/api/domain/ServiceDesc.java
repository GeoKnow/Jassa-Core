package org.aksw.facete.web.api.domain;

import java.util.List;


public class ServiceDesc {
	private String serviceIri;
	private List<String> defaultGraphIris;
	public String getServiceIri() {
		return serviceIri;
	}
	public void setServiceIri(String serviceIri) {
		this.serviceIri = serviceIri;
	}
	public List<String> getDefaultGraphIris() {
		return defaultGraphIris;
	}
	public void setDefaultGraphIris(List<String> defaultGraphIris) {
		this.defaultGraphIris = defaultGraphIris;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime
				* result
				+ ((defaultGraphIris == null) ? 0 : defaultGraphIris.hashCode());
		result = prime * result
				+ ((serviceIri == null) ? 0 : serviceIri.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ServiceDesc other = (ServiceDesc) obj;
		if (defaultGraphIris == null) {
			if (other.defaultGraphIris != null)
				return false;
		} else if (!defaultGraphIris.equals(other.defaultGraphIris))
			return false;
		if (serviceIri == null) {
			if (other.serviceIri != null)
				return false;
		} else if (!serviceIri.equals(other.serviceIri))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "ServiceDesc [serviceIri=" + serviceIri + ", defaultGraphIris="
				+ defaultGraphIris + "]";
	}
	
	
}